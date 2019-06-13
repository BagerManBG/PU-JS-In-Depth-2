const uuidv1 = require('uuid/v1');
const path = require('path');
const fs = require('fs');
const app_dir = path.dirname(require.main.filename);

/**
 * DriverOurSQL class.
 * This is the database driver class, which handles the queries.
 */
class DriverOurSQL {
  /**
   * DriverOurSQL constructor.
   */
  constructor () {
    this.db_dir = app_dir + '/database/';

    // Regex definitions.
    const regex_operations_create_delete = /^(?<type>operation):\[(?<table>[a-z]+)\] (?<command>establish communism|send to gulag);$/;
    const regex_query_select_delete = /^(?<type>query):\[(?<table>[a-z]+)\] ((?<command>report|send to gulag) (?<target>all|([a-zA-Z0-9\-]+,?\s?)+));$/;
    const regex_query_update = /^(?<type>query):\[(?<table>[a-z]+)\] ((?<command>reinforce) (?<target>[a-zA-Z0-9\-]+)) <json>(?<json_data>.+)<\/json>;$/;
    const regex_query_create = /^(?<type>query):\[(?<table>[a-z]+)\] (?<command>establish unit) <json>(?<json_data>.+)<\/json>;$/;

    this.syntaxRegEx = [
      regex_operations_create_delete,
      regex_query_select_delete,
      regex_query_update,
      regex_query_create,
    ];
  }

  /**
   * @returns {DriverOurSQL}
   *
   * Creates a new instance of the class.
   */
  static create () {
    return new DriverOurSQL();
  }

  /**
   * @param query
   * @returns {*}
   *
   * Executes the query and returns a result object for indication
   * of either success or error.
   */
  execute (query) {
    for (const regex of this.syntaxRegEx) {
      if (regex.test(query)) {
        const data = regex.exec(query).groups;

        // Handles Operation Commands.
        if (data.type === 'operation') {
          // Handles Table Creation.
          if (data.command === 'establish communism') {
            if (!fs.existsSync(this.db_dir + data.table + '.json')) {
              fs.writeFileSync(this.db_dir + data.table + '.json', '{}');
              return {
                status: 'success',
                body: `Created table "${data.table}".`,
              };
            }
            else {
              return {
                status: 'error',
                body: `Table "${data.table}" already exists.`,
              };
            }
          }
          // Handles Table Deletion.
          else if (data.command === 'send to gulag') {
            if (fs.existsSync(this.db_dir + data.table + '.json')) {
              fs.unlinkSync(this.db_dir + data.table + '.json');
              return {
                status: 'success',
                body: `Removed table "${data.table}".`,
              };
            }
            else {
              return {
                status: 'error',
                body: `Table "${data.table}" does not exists.`,
              };
            }
          }
        }
        // Handles Query Commands.
        else if (data.type === 'query') {
          // Check if selected table exists.
          if (fs.existsSync(this.db_dir + data.table + '.json')) {
            let json_data;
            const table_data = JSON.parse(fs.readFileSync(this.db_dir + data.table + '.json'));

            // Handles Records Create.
            if (data.command === 'establish unit') {
              try {
                json_data = JSON.parse(data.json_data);
              }
              catch (e) {
                return {
                  status: 'error',
                  body: `Syntax Error, faulty JSON data.`,
                };
              }
              table_data[uuidv1()] = json_data;

              fs.writeFileSync(this.db_dir + data.table + '.json', JSON.stringify(table_data));
              return {
                status: 'success',
                body: `Added record to table ${data.table}.`,
              };
            }
            // Handles Records Read.
            else if (data.command === 'report') {
              if (data.target === 'all') {
                return {
                  status: 'success',
                  body: `Fetched all records from "${data.table}".`,
                  records: table_data,
                };
              }
              else {
                data.target = data.target.replace(', ', ',');
                const data_target_array = data.target.split(',');
                let counter = 0;
                const records = {};

                for (const target of data_target_array) {
                  if (table_data.hasOwnProperty(target)) {
                    records[target] = table_data[target];
                    counter++;
                  }
                }

                return {
                  status: 'success',
                  body: `Fetched ${counter} records from "${data.table}".`,
                  records: records,
                };
              }
            }
            // Handles Records Update.
            else if (data.command === 'reinforce') {
              try {
                json_data = JSON.parse(data.json_data);
              }
              catch (e) {
                return {
                  status: 'error',
                  body: `Syntax Error, faulty JSON data.`,
                };
              }

              if (table_data.hasOwnProperty(data.target)) {
                table_data[data.target] = json_data;
              }
              else {
                return {
                  status: 'error',
                  body: `Target uuid doesn't exist.`,
                };
              }

              fs.writeFileSync(this.db_dir + data.table + '.json', JSON.stringify(table_data));
              return {
                status: 'success',
                body: `Updated record in table ${data.table}.`,
              };
            }
            // Handles Records Delete.
            else if (data.command === 'send to gulag') {
              if (data.target === 'all') {
                fs.unlinkSync(this.db_dir + data.table + '.json');
                fs.writeFileSync(this.db_dir + data.table + '.json', '{}');
                return {
                  status: 'success',
                  body: `Removed all records from "${data.table}".`,
                };
              }
              else {
                data.target = data.target.replace(', ', ',');
                const data_target_array = data.target.split(',');
                let counter = 0;

                for (const target of data_target_array) {
                  if (table_data.hasOwnProperty(target)) {
                    delete table_data[target];
                    counter++;
                  }
                }

                fs.writeFileSync(this.db_dir + data.table + '.json', JSON.stringify(table_data));

                return {
                  status: 'success',
                  body: `Removed ${counter} records from "${data.table}".`,
                };
              }
            }
          }
          else {
            return {
              status: 'error',
              body: `Table "${data.table}" does not exists.`,
            };
          }
        }
      }
    }

    return {
      status: 'error',
      body: `Syntax Error.`,
    };
  }
}

module.exports = DriverOurSQL;
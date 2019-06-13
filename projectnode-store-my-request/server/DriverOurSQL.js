const uuidv1 = require('uuid/v1');
const path = require('path');
const fs = require('fs');
const app_dir = path.dirname(require.main.filename);

class DriverOurSQL {
  constructor () {
    this.tables = [];
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

  static create () {
    return new DriverOurSQL();
  }

  execute (query) {
    for (const regex of this.syntaxRegEx) {
      if (regex.test(query)) {
        const data = regex.exec(query).groups;

        if (data.type === 'operation') {
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
        else if (data.type === 'query') {
          if (fs.existsSync(this.db_dir + data.table + '.json')) {
            let json_data;
            const table_data = JSON.parse(fs.readFileSync(this.db_dir + data.table + '.json'));

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
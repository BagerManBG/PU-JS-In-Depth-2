const fs = require('fs');
const path = require('path');
const app_dir = path.dirname(require.main.filename);

const scaffold = function (req, res, next) {
  let file_path;

  file_path = app_dir + '/database/tables.json';

  if (!fs.existsSync(file_path)) {
    const Table = require(app_dir + '/server/models/Table');

    const config = {
      tables: JSON.parse(fs.readFileSync(app_dir + '/config/tables.json', 'utf8')),
    };

    fs.writeFileSync(file_path, JSON.stringify({}));

    let id = 1;
    for (const table_type in config.tables) {

      for (let i = 0; i < config.tables[table_type].count; i ++) {
        Table.create(id, config.tables[table_type].places).save();
        id++;
      }
    }
  }

  file_path = app_dir + '/database/items.json';

  if (!fs.existsSync(file_path)) {
    fs.writeFileSync(file_path, JSON.stringify({}));
  }

  file_path = app_dir + '/database/orders.json';

  if (!fs.existsSync(file_path)) {
    fs.writeFileSync(file_path, JSON.stringify({}));
  }

  next();
};

module.exports = scaffold;
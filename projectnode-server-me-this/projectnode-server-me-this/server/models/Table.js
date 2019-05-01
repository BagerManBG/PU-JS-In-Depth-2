const uuidv1 = require('uuid/v1');
const path = require('path');
const fs = require('fs');
const app_dir = path.dirname(require.main.filename);

class Table {

  constructor (id, places = 1, uuid = uuidv1()) {
    this.uuid = uuid;
    this.id = id;
    this.places = places;
    this.orders = [];
  }

  static create (id, places) {
    return new Table(id, places);
  }

  static load (uuid) {
    const tables = this.loadAllObject();

    for (const index in tables) {
      if (tables[index].uuid === uuid) {
        const table = this.create(tables[index].id);

        table.places = tables[index].places;
        table.orders = tables[index].orders;
        table.uuid = uuid;

        return table;
      }
    }

    return false;
  }

  static loadAllObject () {
    return JSON.parse(fs.readFileSync(app_dir + '/database/tables.json', 'utf8'));
  }

  static loadAll () {
    const all = this.loadAllObject();
    const result = [];

    for (const index in all) {
      result.push(all[index]);
    }

    return result;
  }

  save () {
    const file_path = app_dir + '/database/tables.json';
    const tables = JSON.parse(fs.readFileSync(file_path, 'utf8'));
    let i = 0;

    for (const index in tables) {
      if (tables[index].uuid === this.uuid) {
        tables[index] = this.toSimpleObject();
        fs.writeFileSync(file_path, JSON.stringify(tables));

        return true;
      }
      i = Number(index) + 1;
    }

    tables[i] = this.toSimpleObject();
    fs.writeFileSync(file_path, JSON.stringify(tables));
  }

  toSimpleObject () {
    return {
      uuid: this.uuid,
      id: this.id,
      places: this.places,
      orders: this.orders,
    };
  }
}

module.exports = Table;
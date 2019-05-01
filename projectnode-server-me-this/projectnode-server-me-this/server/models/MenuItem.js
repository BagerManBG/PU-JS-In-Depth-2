const uuidv1 = require('uuid/v1');
const path = require('path');
const fs = require('fs');
const app_dir = path.dirname(require.main.filename);

class MenuItem {

  constructor(category, name, price, active = false, uuid = uuidv1()) {
    this.uuid = uuid;
    this.category = category;
    this.name = name;
    this.price = price;
    this.active = active;
  }

  static create (category, name, price, active) {
    return new MenuItem(category, name, price, active);
  }

  static load (uuid) {
    const items = this.loadAllObject();

    for (const index in items) {
      if (items[index].uuid === uuid) {
        const item = this.create();

        item.category = items[index].category;
        item.name = items[index].name;
        item.price = items[index].price;
        item.active = items[index].active;
        item.uuid = uuid;

        return item;
      }
    }

    return false;
  }

  static loadAllObject () {
    return JSON.parse(fs.readFileSync(app_dir + '/database/items.json', 'utf8'));
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
    const file_path = app_dir + '/database/items.json';
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
      category: this.category,
      name: this.name,
      price: this.price,
      active: this.active,
    };
  }
}

module.exports = MenuItem;
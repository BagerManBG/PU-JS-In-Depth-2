const uuidv1 = require('uuid/v1');
const path = require('path');
const fs = require('fs');
const app_dir = path.dirname(require.main.filename);

class Order {

  constructor (table, uuid = uuidv1()) {
    this.uuid = uuid;
    this.table = table;
    this.items = [];
    this.status = 'placed';
  }

  static create (table) {
    return new Order(table);
  }

  static load (uuid) {
    const orders = this.loadAllObject();

    for (const index in orders) {
      if (orders[index].uuid === uuid) {
        const order = this.create(orders[index].table);

        order.items = orders[index].items;
        order.status = orders[index].status;
        order.uuid = uuid;

        return order;
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
    const orders = JSON.parse(fs.readFileSync(file_path, 'utf8'));
    let i = 0;

    for (const index in orders) {
      if (orders[index].uuid === this.uuid) {
        orders[index] = this.toSimpleObject();
        fs.writeFileSync(file_path, JSON.stringify(orders));

        return true;
      }
      i = Number(index) + 1;
    }

    orders[i] = this.toSimpleObject();
    fs.writeFileSync(file_path, JSON.stringify(orders));
  }

  toSimpleObject () {
    return {
      uuid: this.uuid,
      id: this.table,
      items: this.items,
      status: this.status,
    };
  }
}

module.exports = Order;
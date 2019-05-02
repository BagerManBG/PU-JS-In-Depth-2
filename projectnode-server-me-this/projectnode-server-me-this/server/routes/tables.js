const swig = require('swig');
const path = require('path');
const app_dir = path.dirname(require.main.filename);

const Table = require(app_dir + '/server/models/Table');
const Order = require(app_dir + '/server/models/Order');

const get = function (req, res) {
  const tables = Table.loadAll();
  const orders = Order.loadAll();

  for (const order of orders) {
    for (const table of tables) {
      if (order.table === table.uuid) {
        table.orders.push(order);
      }
    }
  }

  const markup = swig.renderFile(app_dir + '/client/templates/tables.tpl.html', {
    page_title: 'Tables & Orders',
    page_h1: 'Tables & Orders',
    current_path: '/',
    tables: tables,
  });

  res.set('Content-Type', 'text/html');
  res.send(markup);
};

module.exports = {get};
const swig = require('swig');
const path = require('path');
const app_dir = path.dirname(require.main.filename);

const Table = require(app_dir + '/server/models/Table');
const Order = require(app_dir + '/server/models/Order');

const get = function (req, res) {
  const tables = Table.loadAll();
  const orders = Order.loadAll();

  const markup = swig.renderFile(app_dir + '/client/templates/orders.tpl.html', {
    page_title: 'Orders',
    page_h1: 'Orders',
    current_path: '/orders',
    tables: tables,
    orders: orders,
  });

  res.set('Content-Type', 'text/html');
  res.send(markup);
};

module.exports = {get};
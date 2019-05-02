const swig = require('swig');
const path = require('path');
const app_dir = path.dirname(require.main.filename);

const Table = require(app_dir + '/server/models/Table');
const Order = require(app_dir + '/server/models/Order');
const MenuItem = require(app_dir + '/server/models/MenuItem');

const getAll = function (req, res) {
  const tables = Table.loadAll();
  const orders = Order.loadAll();

  orders.forEach(order => {
    order.table = Table.load(order.table);
  });

  const markup = swig.renderFile(app_dir + '/client/templates/orders.tpl.html', {
    page_title: 'Orders',
    page_h1: 'Orders',
    current_path: '/orders',
    tables: tables,
    orders: orders.reverse(),
  });

  res.set('Content-Type', 'text/html');
  res.send(markup);
};

const getSingle = function (req, res) {
  const order = Order.load(req.params.uuid);
  order.table = Table.load(order.table);

  const items = MenuItem.loadAll().filter(item => item.active);

  items.sort((a, b) => (a.category > b.category) ? 1 : -1);

  items.forEach(item => {
    item.category = item.category.charAt(0).toUpperCase() + item.category.slice(1);
  });

  for (const index in order.items) {
    order.items[index] = MenuItem.load(order.items[index]);
  }

  const statuses = [];

  if (order.status === 'placed') {
    statuses.push({
      key: 'refused',
      value: 'Refused',
    });

    statuses.push({
      key: 'finished',
      value: 'Finished',
    });
  }

  const markup = swig.renderFile(app_dir + '/client/templates/orders--single.tpl.html', {
    page_title: 'Order ' + order.uuid,
    page_h1: 'Order ' + order.uuid,
    current_path: '/orders/' + order.uuid,
    order: order,
    items: items,
    statuses: statuses,
  });

  res.set('Content-Type', 'text/html');
  res.send(markup);
};

const post = function (req, res) {
  Order.create(req.body.table).save();
  res.redirect(req.body.redirect);
};

const update = function (req, res) {
  const order = Order.load(req.body.uuid);
  order.items.push(req.body.item);

  if (req.body.status && req.body.status !== 'null') {
    order.status = req.body.status;
  }

  order.save();
  res.redirect(req.body.redirect);
};

module.exports = {getAll, getSingle, post, update};
const swig = require('swig');
const path = require('path');
const app_dir = path.dirname(require.main.filename);

const Table = require(app_dir + '/server/models/Table');

const get = function (req, res) {
  const tables = Table.loadAll();

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
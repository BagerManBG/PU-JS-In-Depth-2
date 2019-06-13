const swig = require('swig');
const path = require('path');
const app_dir = path.dirname(require.main.filename);

const DriverOurSQL = require(app_dir + '/server/DriverOurSQL');
const db = DriverOurSQL.create();

const get = function (req, res) {

  const markup = swig.renderFile(app_dir + '/client/templates/front.tpl.html', {
    page_title: 'OurSQL',
    page_h1: 'OurSQL',
    current_path: '/',
  });

  res.set('Content-Type', 'text/html');
  res.send(markup);
};

const post = function (req, res) {
  const message = db.execute(req.body.query);
  const records = message.records ? JSON.stringify(message.records, undefined, 2) : null;

  const markup = swig.renderFile(app_dir + '/client/templates/front.tpl.html', {
    page_title: 'OurSQL',
    page_h1: 'OurSQL',
    current_path: '/',
    message: message,
    query: req.body.query,
    records: records,
  });

  res.set('Content-Type', 'text/html');
  res.send(markup);
};

module.exports = {get, post};
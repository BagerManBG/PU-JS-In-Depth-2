const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const app_dir = path.dirname(require.main.filename);

const middleware_scaffold = require(app_dir + '/server/middleware/scaffold');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(middleware_scaffold);

const route_menu = require(app_dir + '/server/routes/menu');
const route_tables = require(app_dir + '/server/routes/tables');
const route_orders = require(app_dir + '/server/routes/orders');

// GET
app.get('/', route_tables.get);
app.get('/orders', route_orders.get);
app.get('/menu', route_menu.get);

// POST
app.post('/menu/add', route_menu.post);
app.post('/menu/update/active', route_menu.update);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
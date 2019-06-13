const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const app_dir = path.dirname(require.main.filename);

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const route_front = require(app_dir + '/server/routes/front');

// GET
app.get('/', route_front.get);

// POST
app.post('/', route_front.post);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
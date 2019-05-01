const express = require('express');
const path = require('path');

const middleware_scaffold = require('./server/middleware/scaffold');

const app = express();
const port = 3000;

app.use(middleware_scaffold);

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/public/html/index.html'));
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
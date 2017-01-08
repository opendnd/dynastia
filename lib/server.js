var fs         = require('fs'),
    bodyParser = require('body-parser')
    express    = require('express'),
    app        = express(),
    loader     = require('./loader'),
    prettyjson = require('prettyjson'),
    path       = require('path'),
    rootDir    = path.join(__dirname, '..'),
    libDir     = path.join(rootDir, 'lib');

DYNASTIA_PORT = process.env.DYNASTIA_PORT || 8090;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function server(filepath) {
  var dynasty = loader(filepath);

  app.get('/', function (req, res) {
    res.send('Welcome to Dynastia');
  });

  // listen for server requests
  app.listen(DYNASTIA_PORT, function () {
    console.log('Dynastia server running: http://localhost:' + DYNASTIA_PORT);
  });
}

module.exports = server;
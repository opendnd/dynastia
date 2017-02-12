var fs         = require('fs'),
    bodyParser = require('body-parser')
    express    = require('express'),
    app        = express(),
    loader     = require('./loader'),
    prettyjson = require('prettyjson'),
    path       = require('path'),
    Handlebars = require('handlebars'),
    rootDir    = path.join(__dirname, '..'),
    libDir     = path.join(rootDir, 'lib'),
    dataDir    = path.join(libDir, 'data'),
    guiDir     = path.join(rootDir, 'gui'),
    tplDir     = path.join(guiDir, 'tpl'),
    vendorDir  = path.join(tplDir, 'vendor'),
    Renderer   = require(path.join(libDir, 'renderer'));

DYNASTIA_PORT = process.env.DYNASTIA_PORT || 8090;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/vendor/', express.static(vendorDir));

function server(filepath) {
  var dynasty = loader(filepath);

  // get wiki html
  var source   = fs.readFileSync(path.join(tplDir, 'wiki.html'), { encoding: 'utf8' }),
      template = Handlebars.compile(source);

  // get the main page
  app.get('/', function (req, res) {
    res.send(template(dynasty));
  });

  // listen for server requests
  app.listen(DYNASTIA_PORT, function () {
    console.log('Dynastia server running: http://localhost:' + DYNASTIA_PORT);
    console.log('Root person: ' + dynasty.id);
  });
}

module.exports = server;
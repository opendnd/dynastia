var fs         = require('fs'),
    bodyParser = require('body-parser')
    express    = require('express'),
    app        = express(),
    loader     = require('./loader'),
    prettyjson = require('prettyjson'),
    path       = require('path'),
    rootDir    = path.join(__dirname, '..'),
    libDir     = path.join(rootDir, 'lib'),
    guiDir     = path.join(rootDir, 'gui'),
    tplDir     = path.join(guiDir, 'tpl');
    Renderer   = require(path.join(libDir, 'renderer'));

DYNASTIA_PORT = process.env.DYNASTIA_PORT || 8090;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function server(filepath) {
  var dynasty = loader(filepath);

  // load dynasty page
  Renderer.renderDynasty('', dynasty, true, function (html) {
    
    // add extra html from template
    var pdfHTML = fs.readFileSync(path.join(tplDir, 'pdf.html'), { encoding: 'utf8' });
    pdfHTML = pdfHTML.replace('{{yield}}', html);

    // add extra styles
    var styles = fs.readFileSync(path.join(tplDir, 'server.css'), { encoding: 'utf8' });
    pdfHTML = pdfHTML.replace('/* {{styles}} */', styles);

    // replace PDF with Server
    var serverHTML = pdfHTML.replace('id="pdf"', 'id="server"');

    // get the main page
    app.get('/', function (req, res) {
      res.send(serverHTML);
    });

    // listen for server requests
    app.listen(DYNASTIA_PORT, function () {
      console.log('Dynastia server running: http://localhost:' + DYNASTIA_PORT);
    });
  });
}

module.exports = server;
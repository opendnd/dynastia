var fs         = require('fs'),
    bodyParser = require('body-parser')
    express    = require('express'),
    app        = express(),
    loader     = require('./loader'),
    prettyjson = require('prettyjson'),
    path       = require('path'),
    rootDir    = path.join(__dirname, '..'),
    libDir     = path.join(rootDir, 'lib'),
    dataDir    = path.join(libDir, 'data'),
    guiDir     = path.join(rootDir, 'gui'),
    tplDir     = path.join(guiDir, 'tpl'),
    vendorDir  = path.join(tplDir, 'vendor'),
    Renderer   = require(path.join(libDir, 'renderer'));

var TextGenerator = require(path.join(libDir, 'text-generator')),
    textGenerator = new TextGenerator();

DYNASTIA_PORT = process.env.DYNASTIA_PORT || 8090;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/vendor/', express.static(vendorDir));

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
    // var serverHTML = pdfHTML.replace('id="pdf"', 'id="server"');

    // set gen data
    var fatherName = 'Unknown';
    if (dynasty.father !== undefined) fatherName = dynasty.father.name;
    var motherName = 'Unknown';
    if (dynasty.mother !== undefined) motherName = dynasty.mother.name;

    var genData = require(path.join(dataDir, 'backstory.json'));
    genData['name']          = [dynasty.name];
    genData['birth_year']    = [Renderer.year(dynasty.birth)];
    genData['death_year']    = [Renderer.year(dynasty.death)];
    genData['marriage_year'] = [Renderer.year(dynasty.birth + 20)];
    genData['father_name']   = [fatherName];
    genData['mother_name']   = [motherName];
    genData['spouse_name']   = [dynasty.spouse.name];
    textGenerator.genData    = genData;

    // get wiki html
    var wikiHTML   = fs.readFileSync(path.join(tplDir, 'wiki.html'), { encoding: 'utf8' });
    var serverHTML = wikiHTML.replace(/\{\{name\}\}/g, dynasty.name);
    serverHTML     = serverHTML.replace(/\{\{birth\}\}/g, Renderer.year(dynasty.birth));
    serverHTML     = serverHTML.replace(/\{\{death\}\}/g, Renderer.year(dynasty.death));
    serverHTML     = serverHTML.replace(/\{\{father_name\}\}/g, fatherName);
    serverHTML     = serverHTML.replace(/\{\{mother_name\}\}/g, motherName);
    serverHTML     = serverHTML.replace(/\{\{spouse_name\}\}/g, dynasty.spouse.name);
    serverHTML     = serverHTML.replace(/\{\{backstory_early_life\}\}/g, textGenerator.generateText('backstory_early_life'));
    serverHTML     = serverHTML.replace(/\{\{backstory_career\}\}/g, textGenerator.generateText('backstory_career'));
    serverHTML     = serverHTML.replace(/\{\{backstory_personal_life\}\}/g, textGenerator.generateText('backstory_personal_life'));
    serverHTML     = serverHTML.replace(/\{\{backstory_death\}\}/g, textGenerator.generateText('backstory_death'));

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
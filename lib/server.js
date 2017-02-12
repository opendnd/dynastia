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

// credit for original function: 
// http://stackoverflow.com/questions/22222599/javascript-recursive-search-in-json-object
function findPerson(id, currentPerson) {
  var i, currentIssue, result;

  // check spouse
  if (id === currentPerson.spouse.id) return currentPerson.spouse;
  if (id === currentPerson.id) return currentPerson;

  // loop through the issue
  for (i = 0; i < currentPerson.issue.length; i += 1) {
    currentIssue = currentPerson.issue[i];

    // Search in the current issue
    result = findPerson(id, currentIssue);

    // Return the result if the node has been found
    if (result !== false) {
      return result;
    }
  }

  // The node has not been found and we have no more options
  return false;
}

// render the server
function server(filepath) {
  var dynasty = loader(filepath);

  // get wiki html
  var source   = fs.readFileSync(path.join(tplDir, 'wiki.html'), { encoding: 'utf8' }),
      template = Handlebars.compile(source);

  // get the main page
  app.get('/', function (req, res) {
    res.send(template(dynasty));
  });

  // get the person page
  app.get('/:id', function (req, res) {
    var id = req.params.id,
        person = findPerson(id, dynasty);

    if (person) {
      console.log(person);
      res.send(template(person));
    } else {
      res.send('Person not found!');
    }
  });

  // listen for server requests
  app.listen(DYNASTIA_PORT, function () {
    console.log('Dynastia server running: http://localhost:' + DYNASTIA_PORT);
    console.log('Root person: ' + dynasty.id);
  });
}

module.exports = server;
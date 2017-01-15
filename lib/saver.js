var colors   = require('colors/safe'),
    path     = require('path'),
    rootDir  = path.join(__dirname, '..'),
    libDir   = path.join(rootDir, 'lib'),
    fs       = require('fs');

function saver(filepath, dynasty) {
  var zip  = new require('node-zip')();
  zip.file('dynasty.json', JSON.stringify(dynasty));

  // write the file
  var data = zip.generate({ base64: false, compression: 'DEFLATE' });
  fs.writeFileSync(filepath, data, 'binary');

  return;
}

module.exports = saver;
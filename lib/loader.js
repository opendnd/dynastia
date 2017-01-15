var colors   = require('colors/safe'),
    path     = require('path'),
    rootDir  = path.join(__dirname, '..'),
    libDir   = path.join(rootDir, 'lib'),
    Renderer = require(path.join(libDir, 'renderer')),
    fs       = require('fs'),
    valid    = true,
    dynasty, relativePath, ext;

function loader(filepath) {
  ext = filepath.substr(filepath.length - 4);

  // validate the file
  if (!fs.existsSync(filepath)) {
    valid = false;
    console.log(colors.red('Error: File not found!'));
    return valid;
  }

  // validate the extension
  if (ext !== '.dyn') {
    valid = false;
    console.log(colors.red('Error: File not correct extension!'));
    return valid;
  }

  var zip = new require('node-zip')(fs.readFileSync(filepath), { base64: false, checkCRC32: true });

  if (Object.keys(zip.files).indexOf('dynasty.json') < 0) {
    valid = false;
    console.log(colors.red('Error: File corrupt!'));
    return valid;
  }

  // if it's valid let's continue
  if (valid) {
    dynasty = JSON.parse(zip.files['dynasty.json']._data);
    return dynasty;
  } 
}

module.exports = loader;
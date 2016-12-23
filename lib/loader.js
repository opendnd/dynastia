var colors   = require('colors/safe'),
    path     = require('path'),
    rootDir  = path.join(__dirname, '..'),
    libDir   = path.join(rootDir, 'lib'),
    renderer = require(path.join(libDir, 'renderer')),
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

  // if it's valid let's continue
  if (valid) {
    dynasty = JSON.parse(fs.readFileSync(filepath, { encoding: 'utf-8' }));
    renderer.dynasty(dynasty);
    return valid;
  } 
}

module.exports = loader;
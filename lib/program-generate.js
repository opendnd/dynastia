const program = require('commander');
const path = require('path');
const rootDir = path.join(__dirname, '..');
const libDir = path.join(rootDir, 'lib');
const wizard = require(path.join(libDir, 'wizard'));

// program basics
program
  .option('-o, --output <dir>', 'output directory')
  .parse(process.argv);

// go through the wizard
wizard(program.output);

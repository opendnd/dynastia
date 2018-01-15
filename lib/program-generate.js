const program = require('commander');
const path = require('path');
const rootDir = path.join(__dirname, '..');
const libDir = path.join(rootDir, 'lib');
const Renderer = require(path.join(libDir, 'renderer'));
const Saver = require(path.join(libDir, 'saver'));
const wizard = require(path.join(libDir, 'wizard'));

// program basics
program
  .option('-i, --input <file>', 'input *.dyn file')
  .option('-o, --output <dir>', 'output directory')
  .parse(process.argv);

// load a file or go through the wizard
if (program.input) {
  const dynasty = Saver.load(program.input);
  Renderer.output(dynasty);

// go through the wizard
} else {
  wizard(program.output);
}

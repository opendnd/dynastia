const program = require('commander');
const path = require('path');
const rootDir = path.join(__dirname, '..');
const libDir = path.join(rootDir, 'lib');
const Renderer = require(path.join(libDir, 'renderer'));
const Saver = require(path.join(libDir, 'saver'));

// program basics
program
  .option('-i, --input <file>', 'input *.dyn file')
  .option('--verbose', 'verbose output')
  .parse(process.argv);

// load a file or go through the wizard
if (program.input) {
  const dynasty = Saver.load(program.input);
  Renderer.output(dynasty);
  if (program.verbose) Renderer.outputPersons(dynasty); // output all people if verbose
}

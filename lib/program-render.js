const program = require('commander');
const Personae = require('personae');
const colors = require('colors');
const path = require('path');
const rootDir = path.join(__dirname, '..');
const libDir = path.join(rootDir, 'lib');
const Renderer = require(path.join(libDir, 'renderer'));
const Saver = require(path.join(libDir, 'saver'));

const hr = '---------------------------------------------';

// program basics
program
  .option('-i, --input <file>', 'input *.dyn file')
  .option('--verbose', 'verbose output')
  .parse(process.argv);

// load a file or go through the wizard
if (program.input) {
  const dynasty = Saver.load(program.input);
  Renderer.output(dynasty);

  // output all people if verbose
  if (program.verbose) {
    Object.values(dynasty.persons).forEach((person) => {
      process.stdout.write(colors.white(`${hr}\n`));
      process.stdout.write(colors.bold.yellow(Renderer.name(person)));
      Personae.output(person);
    });
  }
}

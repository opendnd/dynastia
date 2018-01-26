const program = require('commander');
const path = require('path');
const rootDir = path.join(__dirname, '..');
const pinfo = require(path.join(rootDir, 'package.json'));

// program basics
program
  .version(pinfo.version, '-v, --version')
  .description(pinfo.description)
  .command('generate', 'generate a dynasty', { isDefault: true })
  .alias('gen')
  .command('ancestors', 'generate ancestors for a person')
  .alias('anc')
  .command('descendants', 'generate descendants for a person')
  .alias('des')
  .command('render', 'render an inputted dynasty')
  .alias('echo')
  .parse(process.argv);

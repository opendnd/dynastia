const term = require('terminal-kit').terminal;
const colors = require('colors');
const Personae = require('personae');
const program = require('commander');
const path = require('path');
const rootDir = path.join(__dirname, '..');
const libDir = path.join(rootDir, 'lib');
const Renderer = require(path.join(libDir, 'renderer'));
const Saver = require(path.join(libDir, 'saver'));

// program basics
program
  .option('-i, --input <file>', 'input *.dyn file')
  .option('-t, --interface', 'flag to interface with the dynasty')
  .option('--verbose', 'verbose output')
  .parse(process.argv);

// load a file or go through the wizard
if (program.input) {
  const dynasty = Saver.load(program.input);
  const { persons, yearFormat } = dynasty;

  if (program.interface) {
    let person;
    let displayPerson;

    // display a list of persons
    const displayPersonList = () => {
      term.clear();
      term.white('Please select a person from the Dynasty below for more information:\n\n');
      const items = Object.values(persons).map(nPerson => colors.white(Renderer.name(nPerson, yearFormat)));
      term.singleColumnMenu(items.concat(['↵  Exit']), displayPerson);
    };

    // display person actions
    const displayPersonActions = (err, res) => {
      if (res.selectedIndex === 0) {
        term.clear();
        const filepath = `${person.name}.per`;
        Personae.save(filepath, person);
        term.white(`\nExporting... ${filepath}\n\n`);
        process.exit();
      } else if (res.selectedIndex === 2) {
        term.clear();
        process.exit();
      }

      displayPersonList();
    };

    // display a person
    displayPerson = (err, res) => {
      term.clear();
      if (res.selectedIndex === Object.values(persons).length) process.exit();

      // grab the person and continue
      person = Object.values(persons)[res.selectedIndex];
      Renderer.outputPerson(person);
      term.white(Renderer.hr());
      const items = ['→ Export *.per', '← Back', '↵ Exit'];
      term.singleColumnMenu(items, displayPersonActions);
    };

    displayPersonList();
  } else {
    Renderer.output(dynasty);
    if (program.verbose) Renderer.outputPersons(dynasty); // output all people if verbose
  }
}

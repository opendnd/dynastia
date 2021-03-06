const program = require('commander');
const colors = require('colors');
const Personae = require('personae');
const Genetica = require('genetica');
const path = require('path');
const rootDir = path.join(__dirname, '..');
const libDir = path.join(rootDir, 'lib');
const Renderer = require(path.join(libDir, 'renderer'));
const Dynastia = require(path.join(libDir, 'dynastia'));
const Saver = require(path.join(libDir, 'saver'));

// program basics
program
  .option('-i, --input <file>', 'input *.per file')
  .option('-n, --number <number>', 'number of generations')
  .option('-y, --year <year>', 'current year')
  .option('-f, --format <format>', 'year format ex: BCE/CE')
  .option('-t, --type <type>', 'type of inheritance')
  .option('-o, --output <dir>', 'output directory')
  .option('-h, --husband <seed>', 'input a husband seed')
  .option('-w, --wife <seed>', 'input a wife seed')
  .option('--verbose', 'verbose output')
  .parse(process.argv);

// if we have an input passed
if (program.input) {
  const outputDir = program.output || '.';
  const player = Personae.load(program.input);
  const { theme, DNA } = player;
  const { race, uuid } = DNA;
  const currentYear = parseInt((program.year || 1), 10);

  // get seeds
  let husbandSeed;
  if (program.husband) husbandSeed = Genetica.loadSeed(program.husband);
  let wifeSeed;
  if (program.wife) wifeSeed = Genetica.loadSeed(program.wife);

  // create the generator
  const dynastia = new Dynastia({
    race,
    theme,
    startingYear: 1000, // we're going to change the years
    yearFormat: program.format,
    generationsCount: program.number,
    inheritance: program.type,
    husbandSeed,
    wifeSeed,
  });

  // generate the dynasty
  let dynasty = dynastia.generate();
  const { regnants, persons } = dynasty;

  // find the last regnant
  const lastRegnantID = regnants[regnants.length - 1];
  const lastRegnant = Object.assign({}, persons[lastRegnantID]);

  // setup the player
  player.birthYear = currentYear - player.age;
  player.issue = [];
  player.isHeir = true;

  // find how much to alter the years
  const diff = player.birthYear - lastRegnant.birthYear;

  // remove the last regnant
  delete persons[lastRegnantID];

  // go through the persons and adjust the years
  Object.values(persons).map((person) => {
    if (person.birthYear) person.birthYear += diff;
    if (person.deathYear) person.deathYear += diff;
    if (person.marriageYear) person.marriageYear += diff;
    if (person.deathYear >= currentYear) person.deathYear = undefined;

    return person;
  });

  // replace the regnants
  regnants.splice((regnants.length - 1), 1);
  regnants.push(uuid);
  persons[uuid] = player;

  // update dynasty
  dynasty.persons = persons;
  dynasty.regnants = regnants;

  // replace any instances of the old regnant
  const dynastyJSON = JSON.stringify(dynasty).replace(new RegExp(lastRegnantID, 'g'), uuid);
  dynasty = JSON.parse(dynastyJSON);

  // output and save
  Renderer.output(dynasty);
  if (program.verbose) Renderer.outputPersons(dynasty);
  Saver.finish(outputDir, 'Would you like to save your ancestors? (y | n)', dynasty, player.name);
} else {
  process.stdout.write(colors.red('You must pass an "--input" parameter with the *.per file\n'));
}

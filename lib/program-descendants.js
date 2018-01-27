const randomWeighted = require('random-weighted');
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
const defaults = require(path.join(libDir, 'defaults'));

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
  const progenitor = Personae.load(program.input);
  const { theme, DNA, name } = progenitor;
  const { race, gender } = DNA;
  const currentYear = parseInt((program.year || 1), 10);
  const startingYear = currentYear - progenitor.age;

  // create a random age
  const ageGroup = defaults.ageGroups[randomWeighted(defaults.lifeAgeGroupWeights[gender])];
  const age = Personae.generateAge(race, ageGroup);
  progenitor.age = age;

  // get seeds
  let husbandSeed;
  if (program.husband) husbandSeed = Genetica.loadSeed(program.husband);
  let wifeSeed;
  if (program.wife) wifeSeed = Genetica.loadSeed(program.wife);

  // create the generator
  const dynastia = new Dynastia({
    race,
    theme,
    startingYear,
    name,
    yearFormat: program.format,
    generationsCount: program.number,
    inheritance: program.type,
    husbandSeed,
    wifeSeed,
  });

  const dynasty = dynastia.generate({
    progenitor,
  });

  Renderer.output(dynasty);
  if (program.verbose) Renderer.outputPersons(dynasty);
  Saver.finish(outputDir, 'Would you like to save your descendants? (y | n)', dynasty, dynasty.name);
} else {
  process.stdout.write(colors.red('You must pass an "--input" parameter with the *.per file\n'));
}

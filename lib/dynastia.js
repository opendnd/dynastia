// this is the main class for generating a person
const Nomina = require('nomina');
const Personae = require('personae');
const Roll = require('roll');
const path = require('path');
const rootDir = path.join(__dirname, '..');
const libDir = path.join(rootDir, 'lib');
const defaults = require(path.join(libDir, 'defaults'));
const Saver = require(path.join(libDir, 'saver'));
const Simulator = require(path.join(libDir, 'simulator'));
const pinfo = require(path.join(rootDir, 'package.json'));
const roll = new Roll();

class Dynastia {

  // init
  constructor(opts = {}) {
    this.opts = opts;

    // initialize personae
    this.personae = new Personae();

    // persons db
    this.persons = {};
  }

  // list defaults
  static getDefaults() {
    return defaults;
  }

  // load a file and return person
  static load(filepath) {
    return Saver.load(filepath);
  }

  // validate the options
  validateOpts(opts = {}) {
    // theme
    if (opts.theme === undefined) opts.theme = defaults.themes.sample();
    if (!defaults.themes.includes(opts.theme)) opts.theme = defaults.themes.sample();

    // race
    if (opts.race === undefined) opts.race = defaults.races.sample();
    if (!defaults.races.includes(opts.theme)) opts.race = defaults.races.sample();

    // startingYear
    if ((opts.startingYear === undefined) || (opts.startingYear === '')) opts.startingYear = roll.roll('1d3000').result;
    opts.startingYear = parseInt(opts.startingYear, 10);

    // yearFormat
    if ((opts.yearFormat === undefined) || (opts.yearFormat === '')) opts.yearFormat = 'BCE/CE';

    // generations count
    if ((opts.generationsCount === undefined) || (opts.generationsCount === '')) opts.generationsCount = 1;
    opts.generationsCount = parseInt(opts.generationsCount, 10);

    // inheritance system
    if ((opts.inheritance === undefined) || (opts.inheritance === '')) opts.inheritance = defaults.inheritances[0];
    if (!defaults.inheritances.includes(opts.inheritance)) opts.inheritance = defaults.inheritances[0];

    this.opts = opts;

    return opts;
  }

  // reset opts
  resetOpts() {
    this.opts = {};
  }

  // get heir
  static getHeir(issue = [], persons = {}, inheritance = '') {
    let heir;

    // iterate through the children
    issue.forEach((childID) => {
      if (heir) return;
      const child = persons[childID];
      if ((inheritance === defaults.inheritances[0]) && (child.DNA.gender === 'male')) heir = child;
      if ((inheritance === defaults.inheritances[1]) && (child.DNA.gender === 'female')) heir = child;
      if (inheritance === defaults.inheritances[2]) heir = child;
    });

    // add the isHeir flag if it exists
    if (heir) heir.isHeir = true;

    return heir;
  }

  // generate a progenitor for the dynasty
  generateProgenitor() {
    const { theme, race, inheritance } = this.opts;
    let gender;

    if (inheritance === defaults.inheritances[0]) gender = 'male';
    if (inheritance === defaults.inheritances[1]) gender = 'female';
    if (inheritance === defaults.inheritances[2]) gender = defaults.genders.sample();

    const age = Simulator.generateLifeAge(race, gender);

    const progenitor = this.personae.generate({
      theme,
      race,
      gender,
      age,
    });

    return progenitor;
  }

  // simulate progenitor
  simulateProgenitor(startingYear = 0, progenitor, inheritance) {
    const simulator = new Simulator({
      startingYear,
    });

    // retry if we didn't have any issue
    progenitor = simulator.simulate(progenitor);
    const { issue } = progenitor;
    const { persons } = simulator;

    // simulation result
    let simulation = {
      progenitor,
      persons,
    };

    // check if we have at least one heir
    const heir = Dynastia.getHeir(issue, persons, inheritance);
    if (heir === undefined) simulation = this.simulateProgenitor(startingYear, progenitor, inheritance);

    return simulation;
  }

  // generate a generation
  generateGeneration(generationsCount = 0, startingYear = 0, progenitor) {
    const { inheritance } = this.opts;
    generationsCount -= 1;
    let consort;
    let regnant;
    let heir;
    const generation = {};

    const simulation = this.simulateProgenitor(startingYear, progenitor, inheritance);
    this.persons = Object.assign(this.persons, simulation.persons);
    progenitor = simulation.progenitor;
    const { issue } = progenitor;

    // assign regnant / consort
    if (progenitor.DNA.gender === 'male') {
      consort = this.persons[progenitor.spouseID];
      regnant = progenitor;
    } else {
      regnant = progenitor;
      consort = this.persons[progenitor.spouseID];
    }

    generation.regnant = regnant.DNA.uuid;

    // if we have a consort proceed
    if (consort) {
      generation.consort = consort.DNA.uuid;

      // get heir and add
      heir = Dynastia.getHeir(issue, this.persons, inheritance);
      if (heir && (generationsCount > 0)) generation.heir = this.generateGeneration(generationsCount, heir.birthYear, heir);
    }

    return generation;
  }

  // generate a dynasty
  generate(opts = {}) {
    const { version } = pinfo;
    const genOpts = this.validateOpts(Object.assign(this.opts, opts));
    const { theme, race, startingYear, yearFormat, inheritance, generationsCount } = genOpts;
    const name = Nomina.generate({ theme, gender: 'male' });

    // generate generations
    const progenitor = this.generateProgenitor();
    const generations = this.generateGeneration(generationsCount, startingYear, progenitor);

    const dynasty = {
      version,
      theme,
      race,
      inheritance,
      startingYear,
      yearFormat,
      name,
      generations,
      persons: this.persons,
    };

    this.resetOpts();

    return dynasty;
  }
}

module.exports = Dynastia;

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
const Names = require(path.join(libDir, 'names'));
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

    // list of regnants in order
    this.regnants = [];

    // override the name
    this.overrideName = true;
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
    if ((opts.theme === undefined) || (opts.theme === '')) opts.theme = defaults.themes.sample();
    if (!defaults.themes.includes(opts.theme)) opts.theme = defaults.themes.sample();

    // race
    if ((opts.race === undefined) || (opts.race === '')) opts.race = defaults.races.sample();
    if (!defaults.races.includes(opts.race)) opts.race = defaults.races.sample();

    // name
    if ((opts.name === undefined) || (opts.name === '')) opts.name = Nomina.generate({ theme: opts.theme, gender: 'male' });

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
  async simulateProgenitor(startingYear = 0, progenitor, inheritance) {
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
    if (heir === undefined) {
      simulation = await this.simulateProgenitor(startingYear, progenitor, inheritance);
    }

    return simulation;
  }

  // generate a generation
  async generateGeneration(generationsCount = 0, startingYear = 0, progenitor, inheritance) {
    generationsCount -= 1;
    let consort;
    let regnant;
    let heir;
    const generation = {};

    // simluate a progenitor
    const simulation = await this.simulateProgenitor(startingYear, progenitor, inheritance);

    // update the progenitor
    if (this.overrideName) {
      simulation.progenitor.name = this.names.generate();

      // update the names if special
      if (roll.roll('1d20').result === 1) {
        this.names.pushName(simulation.progenitor.name);
        simulation.progenitor.epithet = defaults.epithets.sample();
      }
    } else {
      this.names.pushName(simulation.progenitor.name);
      this.overrideName = true;
    }

    this.persons[simulation.progenitor.DNA.uuid] = simulation.progenitor;

    // assign persons
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

    // add regnant and to list regnants
    generation.regnant = regnant.DNA.uuid;
    this.regnants.push(regnant.DNA.uuid);

    // if we have a consort proceed
    if (consort) {
      generation.consort = consort.DNA.uuid;

      // get heir and add
      heir = Dynastia.getHeir(issue, this.persons, inheritance);
      if (heir && (generationsCount > 0)) {
        generation.heir = await this.generateGeneration(generationsCount, heir.birthYear, heir, inheritance);
      }
    }

    return generation;
  }

  // generate a dynasty
  async generate(opts = {}) {
    const { version } = pinfo;
    const genOpts = this.validateOpts(Object.assign(this.opts, opts));
    const { name, theme, race, startingYear, yearFormat, inheritance, generationsCount } = genOpts;

    // default gender
    let gender = defaults.genders.sample();
    if (inheritance === defaults.inheritances[0]) gender = 'male';
    if (inheritance === defaults.inheritances[1]) gender = 'female';

    // init names
    this.names = new Names({
      gender,
      theme,
    });

    // if we have a progenitor don't override the first progenitor's name
    if (opts.progenitor) this.overrideName = false;

    // generate generations
    const progenitor = opts.progenitor || this.generateProgenitor();
    const generations = await this.generateGeneration(generationsCount, startingYear, progenitor, inheritance);

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
      regnants: this.regnants,
    };

    this.resetOpts();
    return dynasty;
  }
}

module.exports = Dynastia;

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

  // output inheritance
  generateInheritanceType(coin) {
    if (coin === undefined) coin = roll.roll('1d2').result;
    const { inheritance } = this.opts;

    // if inheritance is patrilineality or ambilineality and a coin flip of 1
    if ((inheritance === defaults.inheritances[0]) || ((inheritance === defaults.inheritances[2]) && (coin === 1))) {
      return defaults.inheritances[0];
    // if inheritance is matrilineality or ambilineality and a coin flip of 2
    } else if ((inheritance === defaults.inheritances[1]) || ((inheritance === defaults.inheritances[2]) && (coin === 2))) {
      return defaults.inheritances[1];
    }

    // something else was passed so do first option
    return defaults.inheritances[0];
  }

  // generate a progenitor for the dynasty
  generateProgenitor() {
    const { theme, race } = this.opts;
    const inheritanceType = this.generateInheritanceType();
    let gender;

    if (inheritanceType === defaults.inheritances[0]) gender = 'male';
    if (inheritanceType === defaults.inheritances[1]) gender = 'female';

    const age = Simulator.generateLifeAge(race, gender);

    const progenitor = this.personae.generate({
      theme,
      race,
      gender,
      age,
    });

    return progenitor;
  }

  // generate a generation
  generateGeneration(generationsCount = 0, startingYear = 0, progenitor) {
    generationsCount -= 1;
    const inheritanceType = this.generateInheritanceType();
    let consort;
    let regnant;
    let successor;
    const generation = {};

    // simulate
    const simulator = new Simulator({
      startingYear,
    });
    progenitor = simulator.simulate(progenitor);
    this.persons = Object.assign(this.persons, simulator.persons);

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

      // find the successor
      if ((progenitor.issue.length > 0) && (generationsCount > 0)) {
        progenitor.issue.forEach((childID) => {
          const child = this.persons[childID];
          if (successor) return;
          if ((inheritanceType === defaults.inheritances[0]) && (child.DNA.gender === 'male')) successor = child;
          if ((inheritanceType === defaults.inheritances[1]) && (child.DNA.gender === 'female')) successor = child;
        });
      }

      // add the successor
      if (successor && (generationsCount > 0)) {
        generation.successor = this.generateGeneration(generationsCount, successor.birthYear, successor);
      }
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

    return dynasty;
  }
}

module.exports = Dynastia;

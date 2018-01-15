// this is the main class for generating a person
const Nomina = require('nomina');
const Personae = require('personae');
const Roll = require('roll');
const path = require('path');
const rootDir = path.join(__dirname, '..');
const libDir = path.join(rootDir, 'lib');
const defaults = require(path.join(libDir, 'defaults'));
const Saver = require(path.join(libDir, 'saver'));
const roll = new Roll();

class Dynastia {

  // init
  constructor(opts = {}) {
    this.opts = opts;

    // initialize personae
    this.personae = new Personae();

    // current year
    this.currentYear = 0;

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

    // yearFormat
    if ((opts.yearFormat === undefined) || (opts.yearFormat === '')) opts.yearFormat = 'BCE/CE';

    // generations count
    if ((opts.generationsCount === undefined) || (opts.generationsCount === '')) opts.generationsCount = 1;

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
  generateInheritanceType() {
    const coin = roll.roll('1d2').result;
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

  // generate a dynasty
  generate(opts = {}) {
    const genOpts = this.validateOpts(Object.assign(this.opts, opts));
    const { theme, race, startingYear, yearFormat, inheritance } = genOpts;
    const name = Nomina.generate({ theme, gender: 'male' });

    // generate generations
    this.currentYear = startingYear;
    const generations = {};

    const dynasty = {
      theme,
      race,
      inheritance,
      startingYear,
      yearFormat,
      name,
      generations,
      persons: this.persons,
    };

    // console.log(JSON.stringify(dynasty));
    // console.log(dynasty);

    return dynasty;
  }
}

module.exports = Dynastia;

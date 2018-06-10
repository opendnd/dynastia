const Nomina = require('nomina');
const RomanNumerals = require('roman-numerals');
const toRoman = RomanNumerals.toRoman;
const Roll = require('roll');
const roll = new Roll();

class Names {
  // init
  constructor(opts = {}) {
    const {
      gender = 'male',
      theme = 'medieval',
      names = {},
      defaultsNomina,
    } = opts;

    // defaults
    this.nomina = new Nomina({
      defaults: defaultsNomina,
    });
    this.theme = theme;
    this.gender = gender;
    this.names = this.validateNames(names);
  }

  // generate random names
  generateNames(gender = 'male', theme = 'medieval') {
    const { result } = roll.roll('1d4');
    const names = {};

    // create the names
    let i = 0;
    while (i < result) {
      const name = this.nomina.generate({ type: gender, theme });
      names[name] = 0;
      i += 1;
    }

    return names;
  }

  // validate the names
  validateNames(names) {
    const { gender, theme } = this;
    if (Object.keys(names).length === 0) return this.generateNames(gender, theme);
    return names;
  }

  // get name from names
  getNameFromNames() {
    const { names } = this;

    const name = Object.keys(names).sample();
    names[name] += 1;

    if (names[name] > 1) {
      return `${name} ${toRoman(names[name])}`;
    }

    return `${name}`;
  }

  // push name
  pushName(name) {
    if (this.names[name] !== undefined) return;
    this.names[name] = 1;
  }

  // generate a name
  generate(force = false) {
    const { gender, theme } = this;
    const { result } = roll.roll('1d2');

    // get from the names pool if a number of conditions are met
    if (
      ((result === 1) || force) &&
      (Object.keys(this.names).length > 0)
    ) {
      return this.getNameFromNames();
    }

    return this.nomina.generate({ type: gender, theme });
  }
}

module.exports = Names;

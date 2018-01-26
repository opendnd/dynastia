const Nomina = require('nomina');
const RomanNumerals = require('roman-numerals');
const toRoman = RomanNumerals.toRoman;
const Roll = require('roll');
const roll = new Roll();

class Names {
  // generate random names
  static generateNames(gender = 'male', theme = 'medieval') {
    const { result } = roll.roll('1d4');
    const names = {};

    // create the names
    let i = 0;
    while (i < result) {
      const name = Nomina.generate({ type: gender, theme });
      names[name] = 0;
      i += 1;
    }

    return names;
  }

  // init
  constructor(opts = {}) {
    const {
      gender = 'male',
      theme = 'medieval',
      names = {},
    } = opts;

    // defaults
    this.theme = theme;
    this.gender = gender;
    this.names = this.validateNames(names);
  }

  // validate the names
  validateNames(names) {
    const { gender, theme } = this;
    if (Object.keys(names).length === 0) return Names.generateNames(gender, theme);
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

    return Nomina.generate({ type: gender, theme });
  }
}

module.exports = Names;

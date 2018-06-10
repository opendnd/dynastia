/* eslint-disable */

const fs = require('fs');
const path = require('path');
const Nomina = require('nomina');
const Personae = require('personae');
const rootDir = path.join(__dirname, '..');
const libDir = path.join(rootDir, 'lib');
const home = process.env.HOME || process.env.USERPROFILE;
const userPath = path.join(home, '.dnd', 'dynastia', 'defaults.js');
let defaults;

// only push unique elements
Array.prototype.pushUnique = function(element) { 
  if (this.indexOf(element) === -1) {
    this.push(element);
  }
};

// grab a random element
Array.prototype.sample = function () {
  return this[Math.floor(Math.random() * this.length)]
};

// get from the user path
if (fs.existsSync(userPath)) {
  defaults = require(userPath);
} else {
  defaults = require(path.join(libDir, 'defaults-default'));
}

// get personae defaults
const personaeDefaults = Personae.getDefaults();
defaults.races = personaeDefaults.races;
defaults.genders = personaeDefaults.genders;
defaults.ageRanges = personaeDefaults.ageRanges;
defaults.ageGroups = personaeDefaults.ageGroups;

module.exports = defaults;

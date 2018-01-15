// this class simulates a person's life
const randomWeighted = require('random-weighted');
const Personae = require('personae');
const Roll = require('roll');
const path = require('path');
const rootDir = path.join(__dirname, '..');
const libDir = path.join(rootDir, 'lib');
const defaults = require(path.join(libDir, 'defaults'));
const roll = new Roll();

class Simulator {
  // init
  constructor(opts = {}) {
    this.opts = opts;

    // initialize personae
    this.personae = new Personae();

    // current year and age
    this.currentYear = opts.startingYear || 0;
    this.currentAge = 0;

    this.doOutput = opts.doOutput || false;

    // persons db
    this.persons = {};
  }

  // generate marriage age
  static generateMarriageAge(race = 'Dragonborn', gender = 'female') {
    const fertilityAgeRange = defaults.fertilityAgeRange[race].split('-');
    const fertilityAgeMin = parseInt(fertilityAgeRange[0], 10);
    const fertilityAgeMax = parseInt(fertilityAgeRange[1], 10);
    const marriageAgeGroup = defaults.ageGroups[randomWeighted(defaults.marriageAgeGroupWeights[gender])];
    let marriageAge = Personae.generateAge(race, marriageAgeGroup);

    // don't let a marriage happen where there is no chance for fertility
    if (marriageAge > fertilityAgeMax) {
      marriageAge = fertilityAgeMax;
    } else if (marriageAge < fertilityAgeMin) {
      marriageAge = fertilityAgeMin;
    }

    // return age
    return marriageAge;
  }

  // generate a child
  generateChild(mother, father) {
    let child = this.personae.generateChild({
      ageGroup: 'old',
    }, mother, father);

    // assign data
    const birthYear = this.currentYear;
    const deathYear = child.age;
    const motherID = mother.DNA.uuid;
    const fatherID = father.DNA.uuid;

    // merge person with new data
    child = Object.assign(child, {
      birthYear,
      deathYear,
      motherID,
      fatherID,
    });
    this.persons[child.DNA.uuid] = child;

    return child;
  }

  // generate a spouse
  generateSpouse(person) {
    const { DNA, theme } = person;
    const { race } = DNA;
    const gender = (DNA.gender === 'male') ? 'female' : 'male';

    let spouse = this.personae.generate({
      gender,
      race,
      theme,
      ageGroup: 'old',
    });

    // assign data
    const marriageAge = Simulator.generateMarriageAge(race, gender);
    const birthYear = this.currentYear - marriageAge;
    const deathYear = birthYear + spouse.age;
    const spouseID = DNA.uuid;
    const marriageYear = this.currentYear;

    // merge person with new data
    spouse = Object.assign(spouse, {
      birthYear,
      deathYear,
      marriageYear,
      spouseID,
      issue: [],
    });
    this.persons[spouse.DNA.uuid] = spouse;

    return spouse;
  }

  // simulate this person's life
  simulate(person) {
    const { DNA } = person;
    const { gender, race } = DNA;
    const birthYear = this.currentYear;
    const deathYear = this.currentYear + person.age;

    // marriage and children
    const marriageAge = Simulator.generateMarriageAge(race, gender);
    const marriageYear = this.currentYear + marriageAge;
    const fertilityDice = defaults.fertility[race];
    const desiredChildren = roll.roll(`1${fertilityDice}`).result + 1;
    const conceptionDice = defaults.conception[race];
    const fertilityAgeRange = defaults.fertilityAgeRange[race].split('-');
    const fertilityAgeMin = parseInt(fertilityAgeRange[0], 10);
    const fertilityAgeMax = parseInt(fertilityAgeRange[1], 10);
    let output = '';
    let child;
    let spouse;
    let spouseType;
    let spouseCurrentAge;
    let spouseAlive = false;
    let mother;
    let father;
    let married = false;
    let fertile = false;
    let childReady = 0;

    // merge person with new data
    person = Object.assign(person, {
      birthYear,
      deathYear,
      marriageYear,
      issue: [],
    });

    if (gender === 'male') {
      father = person;
      spouseType = 'wife';
    } else {
      mother = person;
      spouseType = 'husband';
    }

    // iterate through every year of their life
    while (this.currentYear <= deathYear) {
      output += `\nYear is ${this.currentYear} and my age is ${this.currentAge}...`;

      // update spouse current age
      if (married) {
        spouseCurrentAge = this.currentYear - spouse.birthYear;
        spouseAlive = false;
        if (spouseCurrentAge <= spouse.age) spouseAlive = true;
        if (spouseAlive) output += ` and my ${spouseType}'s age is ${spouseCurrentAge}...`;
        if (!spouseAlive) output += ` and my ${spouseType} passed away...`;
      }

      // marry
      if (this.currentYear === person.marriageYear) {
        married = true;

        // generate spouse
        spouse = this.generateSpouse(person);
        person.spouseID = spouse.DNA.uuid;

        // set mother / father
        if (spouse.DNA.gender === 'male') {
          father = spouse;
        } else {
          mother = spouse;
        }

        output += ' Just got married!';
      }

      // check female fertility
      if (gender === 'female') {
        fertile = false;
        if (
          (this.currentAge >= fertilityAgeMin) &&
          (this.currentAge <= fertilityAgeMax) &&
          (spouseCurrentAge >= fertilityAgeMin)
        ) fertile = true;
      // check male fertility
      } else if ((gender === 'male') && married) {
        fertile = false;
        if (
          (spouseCurrentAge >= fertilityAgeMin) &&
          (spouseCurrentAge <= fertilityAgeMax) &&
          (this.currentAge >= fertilityAgeMin)
        ) fertile = true;
      }

      // decrement the childReady years
      if (childReady > 0) childReady -= 1;

      // if married check if we should have a kid and we've had at least a year to recover
      if (
        (childReady <= 0) &&
        married &&
        spouseAlive &&
        fertile &&
        (person.issue.length < desiredChildren)
      ) {
        // make sure we are successful in conception
        if (roll.roll(`1${conceptionDice}`).result === 1) {
          child = this.generateChild(mother, father);
          person.issue.push(child.DNA.uuid);
          spouse.issue.push(child.DNA.uuid);
          childReady = 2;

          output += ' Just had a kid!';
        }
      }

      // increment the year / age
      this.currentYear += 1;
      this.currentAge += 1;
    }

    // assign final values to the persons DB
    this.persons[person.DNA.uuid] = person;
    if (spouse) this.persons[spouse.DNA.uuid] = spouse;

    // output if we have it and return person
    output += '\n\n';
    if (this.doOutput) process.stdout.write(output);
    return person;
  }
}

module.exports = Simulator;

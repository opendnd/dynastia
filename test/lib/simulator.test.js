const expect = require('chai').expect;
const path = require('path');
const rootDir = path.join(__dirname, '..', '..');
const libDir = path.join(rootDir, 'lib');
const Personae = require('personae');
const Simulator = require(path.join(libDir, 'simulator'));
let personae, simulator, person;

describe('Simulator', () => {
  before(() => {
    simulator = new Simulator({
      startingYear: 1066,
      // doOutput: true,
    });

    personae = new Personae();
  });

  it('can simulate', () => {
    person = personae.generate({
      race: 'Human',
      ageGroup: 'old',
    });
    person = simulator.simulate(person);

    expect(person).to.be.an('object');
  });
});

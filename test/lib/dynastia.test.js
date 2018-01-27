const expect = require('chai').expect;
const path = require('path');
const rootDir = path.join(__dirname, '..', '..');
const libDir = path.join(rootDir, 'lib');
const Dynastia = require(path.join(libDir, 'dynastia'));
const Renderer = require(path.join(libDir, 'renderer'));
let dynastia, dynasty;

describe('Dynastia', () => {
  before(() => {
    dynastia = new Dynastia({
      startingYear: 1066,
      race: 'Human',
      theme: 'medieval',
      generationsCount: 3,
      inheritance: 'patrilineality',
    });
  });

  it('can generate', () => {
    dynasty = dynastia.generate();

    expect(dynasty).to.be.an('object');
    expect(dynasty.generations.regnant).to.be.a('string');
    expect(dynasty.generations.consort).to.be.a('string');
  });

  it('getDefaults returns defaults with genders and races', () => {
    expect(Dynastia.getDefaults().genders).to.be.an('array');
    expect(Dynastia.getDefaults().races).to.be.an('array');
  });
});

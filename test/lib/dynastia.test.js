const expect = require('chai').expect;
const path = require('path');
const rootDir = path.join(__dirname, '..', '..');
const libDir = path.join(rootDir, 'lib');
const Dynastia = require(path.join(libDir, 'dynastia'));
let dynastia, dynasty;

describe('Dynastia', () => {
  before(() => {
    dynastia = new Dynastia();
  });

  it('can generate', () => {
    dynasty = dynastia.generate();

    expect(dynasty).to.be.an('object');
  });

  it('getDefaults returns defaults with genders and races', () => {
    expect(Dynastia.getDefaults().genders).to.be.an('array');
    expect(Dynastia.getDefaults().races).to.be.an('array');
  });
});

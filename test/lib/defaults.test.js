const expect = require('chai').expect;
const path = require('path');
const rootDir = path.join(__dirname, '..', '..');
const libDir = path.join(rootDir, 'lib');
const defaults = require(path.join(libDir, 'defaults'));

describe('defaults', () => {
  it('loads from default', () => {
    expect(defaults).to.be.an('object');
  });

  it('has epithets', () => {
    expect(defaults.epithets).to.be.an('array');
  });

  it('has themes', () => {
    expect(defaults.themes).to.be.an('array');
  });

  it('has genders', () => {
    expect(defaults.genders).to.be.an('array');
  });

  it('has races', () => {
    expect(defaults.races).to.be.an('array');
  });
});

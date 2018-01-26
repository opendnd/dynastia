const expect = require('chai').expect;
const path = require('path');
const rootDir = path.join(__dirname, '..', '..');
const libDir = path.join(rootDir, 'lib');
const Names = require(path.join(libDir, 'names'));
let names, name;

describe('Names', () => {
  before(() => {
    names = new Names();
  });

  it('can generate', () => {
    name = names.generate();

    expect(name).to.be.a('string');
  });

  it('can generate with numeral', () => {
    names = new Names({
      names: {
        'Test': 0,
      },
    });

    expect(names.generate(true)).to.not.include('I'); // don't add numeral for first in series
    expect(names.generate(true)).to.include('II');
    expect(names.generate(true)).to.include('III');
    expect(names.generate(true)).to.include('IV');
    expect(names.generate(true)).to.include('V');
  });

  it('can push a new name', () => {
    names = new Names({
      names: {
        'Test': 0,
      },
    });

    names.pushName('Foo');
    names.pushName('Test');

    expect(names.names['Test']).to.be.eq(0);
    expect(names.names['Foo']).to.be.eq(1);
  });
});

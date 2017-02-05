var expect    = require('chai').expect,
    path      = require('path'),
    rootDir   = path.join(__dirname, '..', '..'),
    libDir    = path.join(rootDir, 'lib'),
    dataDir   = path.join(rootDir, 'lib', 'data');

var NameGenerator = require(path.join(libDir, 'name-generator')),
    egyptian      = require(path.join(dataDir, 'egyptian')),
    result;

describe('NameGenerator', function () {
  describe('#generateName', function () {
    before(function () {
      var generator = new NameGenerator();
      generator.nameSet['egyptian'] = egyptian['names']['male'];
      result = generator.generateName('egyptian');
    });

    it('generates a name from a data set', function () {
      expect(typeof(result)).to.eq('string');
      expect(result.length).to.be.above(0);
    });
  });
});
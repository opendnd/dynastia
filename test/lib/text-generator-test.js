var expect    = require('chai').expect,
    path      = require('path'),
    rootDir   = path.join(__dirname, '..', '..'),
    libDir    = path.join(rootDir, 'lib'),
    dataDir   = path.join(rootDir, 'lib', 'data');

var TextGenerator = require(path.join(libDir, 'text-generator')),
    result;

// test data
var textData = {};
textData['warrior'] = [
  'A {gender} {race} warrior, wearing {armor} and wielding {weapon}.'
];
textData['gender'] = [
  'male', 'female'
];
textData['race'] = {
  '1-3': 'human',
  '4-5': 'dwarf',
    '6': 'elf'
};
textData['armor'] = {
  '01-50': 'leather armor',
  '51-90': 'chainmail',
  '91-00': 'plate armor'
};
textData['weapon'] = [
  '{melee_weapon}',
  '{melee_weapon} and a shield',
  'twin blades',
  '{ranged_weapon}'
];
textData['melee_weapon'] = [
  'a battleaxe', 'a mace', 'a spear', 'a sword'
];
textData['ranged_weapon'] = [
  'a longbow and arrows', 'a heavy crossbow'
];

describe('TextGenerator', function () {
  describe('#generateText', function () {
    before(function () {
      var generator = new TextGenerator();
      generator.genData = textData;
      result = generator.generateText('warrior');
    });

    it('generates a name from a data set', function () {
      expect(typeof(result)).to.eq('string');
      expect(result.length).to.be.above(0);
      expect(result).to.contain('warrior');
    });
  });
});
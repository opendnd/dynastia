var expect    = require('chai').expect,
    path      = require('path'),
    rootDir   = path.join(__dirname, '..', '..'),
    libDir    = path.join(rootDir, 'lib'),
    Generator = require(path.join(libDir, 'generator')),
    renderer  = require(path.join(libDir, 'renderer')),
    person;

describe('Generator', function () {
  before(function () {
    person = Generator.generate(1066);
    renderer.person(person);
  });

  describe('has a spouse', function () {
    it('is defined', function () {
      expect(person.spouse).to.not.be.undefined;  
    });

    it('is female', function () {
      expect(person.spouse.gender).to.eq('female');
    });
  });

  describe('has issue', function () {
    it('is defined', function () {
      expect(person.issue).to.not.be.undefined;
    });

    it('has a birth year after the parent birth', function () {
      expect(person.issue[0].birth).to.be.above(person.birth);
    });

    it('has a death year after the parent birth', function () {
      expect(person.issue[0].death).to.be.above(person.birth);
    });

    it('has a birth year after the spouse birth', function () {
      expect(person.issue[0].birth).to.be.above(person.spouse.birth);
    });

    it('has a death year after the spouse birth', function () {
      expect(person.issue[0].death).to.be.above(person.spouse.birth);
    });
  });

  describe('has person properties', function () {
    it('has a name', function () {
      expect(person.name).to.not.be.undefined;
    });

    it('has a birth year', function () {
      expect(person.birth).to.not.be.undefined;
    });

    it('has a death year', function () {
      expect(person.death).to.not.be.undefined;
    });

    it('has a death year after a birth year', function () {
      expect(person.death).to.be.above(person.birth);
    });

    it('has an age', function () {
      expect(person.age).to.not.be.undefined;
    });

    it('has a gender', function () {
      expect(person.gender).to.not.be.undefined;
    });
  });
});
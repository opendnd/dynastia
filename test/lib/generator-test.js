var expect    = require('chai').expect,
    path      = require('path'),
    rootDir   = path.join(__dirname, '..', '..'),
    libDir    = path.join(rootDir, 'lib'),
    dataDir   = path.join(rootDir, 'lib', 'data'),
    Generator = require(path.join(libDir, 'generator')),
    Renderer  = require(path.join(libDir, 'renderer')),
    person, result, memorables, sr, ii, iii, iv, successor;

describe('Generator', function () {
  describe('#generateSuffix', function () {
    before(function () {
      sr    = Generator.generateSuffix('Alpha');
      ii    = Generator.generateSuffix('Alpha');
      iii   = Generator.generateSuffix('Alpha');
      iv    = Generator.generateSuffix('Alpha');
    });

    it('does not generate a suffix for the first of a name', function () {
      expect(sr).to.eq('');
    });

    it('generates a suffix for the second or more of a name', function () {
      expect(ii).to.eq(' II');
      expect(iii).to.eq(' III');
      expect(iv).to.eq(' IV');
    });
  });

  describe('#preventImpossibleYear', function () {
    describe('it returns the death - age if the year is higher than the death', function () {
      before(function () {
        result = Generator.preventImpossibleYear(2000, 10, 2001);
      });

      it('returns 1990', function () {
        expect(result).to.eq(1990);
      });
    });

    describe('it returns the year in every other scenario', function () {
      before(function () {
        result = Generator.preventImpossibleYear(2000, 12, 1999);
      });

      it('returns 1999', function () {
        expect(result).to.eq(1999);
      });
    });
  });

  describe('#generateName', function () {
    before(function () {
      Generator.theme = require(path.join(dataDir, 'medieval.json'));
    });

    describe('for males', function () {
      before(function () {
        result = Generator.generateName('male');
      });

      it('has a length', function () {
        expect(result).to.have.length.above(0);
      });
    });

    describe('for females', function () {
      before(function () {
        result = Generator.generateName('female');
      });

      it('has a length', function () {
        expect(result).to.have.length.above(0);
      });
    });
  });

  describe('#generate', function () {
    before(function () {
      person = Generator.generate({ year: 1066 });
      // Renderer.person(person);
    });

    describe('has a spouse', function () {
      it('is defined', function () {
        expect(person.spouse).to.not.be.undefined;  
      });

      it('is female', function () {
        expect(person.spouse.gender).to.eq('female');
      });
    });

    describe('has successor', function () {
      before(function () {
        person.issue.forEach(function (child) {
          if (child.successor) {
            successor = child;
          }
        });
      });

      it('is defined', function () {
        expect(successor).to.not.be.undefined;
      });

      it('has a birth year after the father birth', function () {
        expect(successor.birth).to.be.above(person.birth);
      });

      it('has a death year after the father birth', function () {
        expect(successor.death).to.be.above(person.birth);
      });

      it('has a birth year after the mother birth', function () {
        expect(successor.birth).to.be.above(person.spouse.birth);
      });

      it('has a death year after the mother birth', function () {
        expect(successor.death).to.be.above(person.spouse.birth);
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
});
var path       = require('path'),
    toRoman    = require('roman-numerals').toRoman,
    Roll       = require('roll'),
    roll       = new Roll(),
    rootDir    = path.join(__dirname, '..'),
    dataDir    = path.join(rootDir, 'lib', 'data'),
    themes     = require(path.join(dataDir, 'themes.json')),
    epithets   = require(path.join(dataDir, 'epithets.json')),
    suffixes   = {},
    memorables = [];

// grab a random element
Array.prototype.sample = function () {
  return this[Math.floor(Math.random() * this.length)]
};

var Generator = {

  // add a name to the suffix list
  pushSuffix: function (name) {
    if (suffixes[name] === undefined) {
      suffixes[name] = 0;
    }
    suffixes[name] += 1;
    return suffixes[name];
  },

  // generate the suffix
  generateSuffix: function (name) {
    var count = Generator.pushSuffix(name);

    // output the suffix if we have one
    if (count > 1) {
      return ' ' + toRoman(count);
    } else {
      return '';
    }
  },

  // prevent impossible years
  preventImpossibleYear: function (death, age, year) {
    if (year > death) {
      return death - age;
    } else {
      return year;
    }
  },

  // generate a name based on gender
  generateName: function (gender, isTitle) {
    var rolled    = roll.roll('2d20'),
        name      = Generator.theme.names[gender].sample(),
        memorable = false,
        suffix;

    // display a title or not
    if (isTitle === undefined) {
      isTitle = true;
    }

    // do additional naming for males
    if ((gender === 'male') && isTitle) {

      // determine if memorable or not
      if (rolled.rolled[0] === 20) {
        memorable = true;
        memorables.push(name);
      }

      // be named after someone if there is someone to be named after
      if (memorables.length > 0) {
        if (rolled.rolled[1] > 10) {
          name = memorables.sample();
        }
      }

      // generate the suffix
      name += Generator.generateSuffix(name);
      
      // add epithet and make memorable
      if (memorable) {
        name = name + ' the ' + epithets.sample()  
      }
    }

    return name;
  },

  // select successor
  selectSuccessor: function (issue, generations) {
    var successor, i;

    // iterate through the children and find an successor
    issue = issue.map(function (child) {
      if (child.gender === 'male') {
        if (successor === undefined) {
          successor = Generator.generate(child.birth, 'male', generations, true);
          return successor;  
        } else {
          return child;
        }
      } else {
        return child;
      }
    });

    // if we don't have a successor then create one
    if (successor === undefined) {
      issue[0] = Generator.generate(issue[0].birth, 'male', generations, true);
      issue[0]['successor'] = true;
    }

    // return both
    return issue;
  },

  // generate issue
  generateIssue: function (father, mother) {
    var conceptionYear = mother.birth + 12 + roll.roll('2d6').result;

    // represent children as dice rolls
    var childrenCount = roll.roll('1d6').result,
        rolled        = roll.roll(childrenCount + 'd20'),
        issue         = [];

    // iterate through the rolled children
    rolled.rolled.forEach(function (child) {
      conceptionYear += roll.roll('1d4').result;
      conceptionYear  = Generator.preventImpossibleYear(father.death, roll.roll('2d6').result, conceptionYear);
      issue.push(Generator.generate(conceptionYear, ['male', 'female'].sample(), false));
    });

    return issue;
  },

  // generate spouse
  generateSpouse: function (person) {
    var spouseYear, spouse, gender;

    // opposite sex
    if (person.gender === 'female') {
      gender = 'male';
    } else {
      gender = 'female';
    }

    // generate spouse
    spouseYear = person.birth + roll.roll('1d20').result - roll.roll('1d6').result;
    spouseYear = Generator.preventImpossibleYear(person.death, 12, spouseYear);

    return Generator.generate(spouseYear, gender, false, false, true);
  },

  // generate a person
  generate: function (year, gender, generations, successor, spouse) {
    var rolled = roll.roll('2d20'),
        person, age, death, name, issue;

    // set random theme name
    if (Generator.themeName === undefined) {
      Generator.themeName = themes.sample();
    }

    // set the theme
    if (Generator.theme === undefined) {
      Generator.theme = require(path.join(dataDir, Generator.themeName + '.json'));
    }

    // default random year and age
    age = 18 + roll.roll('2d20').result + roll.roll('1d4').result;

    // critical success have higher lifespan
    // critical fail have shorter lifespan
    if (rolled.rolled[0] === 20) {
      age += roll.roll('1d20').result;
    } else if (rolled.rolled[0] === 1) {
      age -= roll.roll('2d4').result; 
    }

    // set the death year
    death = year + age
    
    // default random gender
    if (gender === undefined) {
      gender = 'male';
    }

    // default generations
    if (generations === undefined) {
      generations = 1;
    }

    // generate a basic person
    person = {
      gender : gender,
      birth  : year,
      death  : death,
      age    : age,
      name   : Generator.generateName(gender, false)
    }

    // add successor tag
    if (successor) {
      person.successor = true;
      person.name      = Generator.generateName(gender, true);
    }

    // generate a spouse
    if (spouse === undefined) {
      person.spouse = Generator.generateSpouse(person);
    }

    // generate spouse and successor if we have generations
    if (generations) {

      // generations
      if (generations > 0) {

        // generate issue and successor
        issue        = Generator.generateIssue(person, person.spouse);
        person.issue = Generator.selectSuccessor(issue, generations - 1);
      }
    }

    return person;
  }
}

module.exports = Generator;
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
  generateName: function (gender) {
    var rolled    = roll.roll('2d20'),
        name      = Generator.theme.names[gender].sample(),
        memorable = false,
        suffix;

    // do additional naming for males
    if (gender === 'male') {

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

  // generate a person
  generate: function (year, gender, generations) {
    var rolled = roll.roll('2d20'),
        person, age, death, name, spouse, spouseYear, successorYear;

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
      name   : Generator.generateName(gender)
    }

    // generate spouse and successor if we have generations
    if (generations) {

      // generate spouse
      spouseYear = year + roll.roll('1d20').result - roll.roll('1d6').result;
      spouseYear = Generator.preventImpossibleYear(death, 12, spouseYear);
      person.spouse  = Generator.generate(spouseYear, 'female', false);

      // generations
      if (generations > 0) {

        // generate successor
        successorYear = person.spouse.birth + 12 + roll.roll('4d6').result;
        successorYear = Generator.preventImpossibleYear(death, 0, successorYear);
        person.successor  = Generator.generate(successorYear, 'male', generations - 1);

        // generate a randum number of children
        // @todo: generate siblings
        // @todo: deal with dynamic line of succession (early deaths, no children, etc.)
        // person.issue = [];
        // var childrenCount = 1;
        // for (var i = 0; i < childrenCount; i++) {
        //   var conceptionYear = person.spouse.birth + 12 + roll.roll('2d6').result;
        //   person.issue.push(Generator.generate(conceptionYear, 'male', generations - 1))
        // }
      }
    }

    return person;
  }
}

module.exports = Generator;
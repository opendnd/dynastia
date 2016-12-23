var path       = require('path'),
    faker      = require('faker'),
    toRoman    = require('roman-numerals').toRoman,
    rnum       = faker.random.number,
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

  // generate a name based on gender
  generateName: function (gender) {
    var d20a      = rnum({ min: 1, max: 20 }),
        d20b      = rnum({ min: 1, max: 20 }),
        name      = Generator.theme.names[gender].sample(),
        memorable = false,
        suffix;

    // do additional naming for males
    if (gender === 'male') {

      // determine if memorable or not
      if (d20a === 20) {
        memorable = true;
        memorables.push(name);
      }

      // be named after someone if there is someone to be named after
      if (memorables.length > 0) {
        if (d20b > 10) {
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
    var d20a  = rnum({ min: 1, max: 20 }),
        person, age, name, spouse;

    // set random theme name
    if (Generator.themeName === undefined) {
      Generator.themeName = themes.sample();
    }

    // set the theme
    if (Generator.theme === undefined) {
      Generator.theme = require(path.join(dataDir, Generator.themeName + '.json'));
    }

    // default random year and age
    age = rnum({ min: 14, max: 65});

    // critical success get higher lifespan
    if (d20a === 20) {
      age  = rnum({ min: 14, max: 85});

    // critical fail have a shorter lifespan
    } else if (d20a === 1) {
      age  = rnum({ min: 14, max: 50});
    }
    
    // default random gender
    if (gender === undefined) {
      gender = 'male';
    }

    // default random generations
    if (generations === undefined) {
      generations = 1;
    }

    // generate a basic person
    person = {
      gender : gender,
      birth  : year,
      death  : year + age,
      age    : age,
      name   : Generator.generateName(gender)
    }

    // generate spouse and issue if we have generations
    if (generations) {

      // generate spouse
      person.spouse = Generator.generate(year + rnum({ min: -5, max: 20 }), 'female', false);

      // generations
      if (generations > 0) {
        person.issue = [];

        // generate a randum number of children
        // @todo: generate siblings
        // @todo: deal with dynamic line of succession (early deaths, no children, etc.)
        var childrenCount = 1;
        for (var i = 0; i < childrenCount; i++) {
          var conceptionYear = person.spouse.birth + rnum({ min: 12, max: 35 });
          person.issue.push(Generator.generate(conceptionYear, 'male', generations - 1))
        }
      }
    }

    return person;
  }
}

module.exports = Generator;
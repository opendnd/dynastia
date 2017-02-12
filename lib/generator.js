var path          = require('path'),
    toRoman       = require('roman-numerals').toRoman,
    Roll          = require('roll'),
    md5           = require('js-md5'),
    roll          = new Roll(),
    rootDir       = path.join(__dirname, '..'),
    libDir        = path.join(rootDir, 'lib'),
    dataDir       = path.join(libDir, 'data'),
    themes        = require(path.join(dataDir, 'themes.json')),
    epithets      = require(path.join(dataDir, 'epithets.json')),
    humanDNA      = require(path.join(dataDir, 'dna-human.json')),
    TextGenerator = require(path.join(libDir, 'text-generator')),
    textGenerator = new TextGenerator();

// only push unique elements
Array.prototype.pushUnique = function(element) { 
  if (this.indexOf(element) === -1) {
    this.push(element);
  }
};

// grab a random element
Array.prototype.sample = function () {
  return this[Math.floor(Math.random() * this.length)]
};

var Generator = {
  suffixes   : {},
  memorables : [],
  // themeName,
  // theme,

  // reset base settings
  reset: function () {
    Generator.suffixes   = {};
    Generator.memorables = [];
    Generator.themeName  = undefined;
    Generator.theme      = undefined;
  },

  // add a name to the suffix list
  pushSuffix: function (name) {
    if (Generator.suffixes[name] === undefined) {
      Generator.suffixes[name] = 0;
    }
    Generator.suffixes[name] += 1;
    return Generator.suffixes[name];
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
        Generator.memorables.push(name);
      }

      // be named after someone if there is someone to be named after
      if (Generator.memorables.length > 0) {
        if (rolled.rolled[1] > 10) {
          name = Generator.memorables.sample();
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

  // generate traits from DNA
  generateTraits: function (DNA) {
    var traits = [],
        trait, genes, gene, pairs;

    // iterate through each gene to look for traits
    Object.keys(humanDNA.genes).forEach(function (index) {
      pairs = DNA[index];
      genes = humanDNA.genes[index];

      // iterate through each rule
      Object.keys(genes).forEach(function (rule) {
        trait = genes[rule];

        // 3=3 || 3=4
        if (/^(\d\=\d)$/.test(rule)) {
          var results = rule.match(/^((\d)\=(\d))$/),
              a       = parseInt(results[2]);
              b       = parseInt(results[3]);

          if ((pairs[0] === a) && (pairs[1] === b)) {
            traits.pushUnique(trait);
            return;
          } 
        }

        // >=3
        if (/^(\>\=\d)$/.test(rule)) {
          var results = rule.match(/^(\>\=(\d))$/),
              a       = parseInt(results[2]);

          if ((pairs[0] >= a) && (pairs[1] >= a)) {
            traits.pushUnique(trait);
            return;
          }
        }

        // <=3
        if (/^(\<\=\d)$/.test(rule)) {
          var results = rule.match(/^(\<\=(\d))$/),
              a       = parseInt(results[2]);

          if ((pairs[0] <= a) && (pairs[1] <= a)) {
            traits.pushUnique(trait);
            return;
          }
        }

        // ==3
        if (/^(\=\=\d)$/.test(rule)) {
          var results = rule.match(/^(\=\=(\d))$/),
              a       = parseInt(results[2]);

          if ((pairs[0] === a) || (pairs[1] === a)) {
            traits.pushUnique(trait);
            return;
          }
        }

        // {3}
        if (/^(\{\d\})$/.test(rule)) {
          var results = rule.match(/^(\{(\d)\})$/),
              a       = parseInt(results[2]),
              b       = pairs[0] + pairs[b];

          if (b === a) {
            traits.pushUnique(trait);
            return;
          }
        }

        // !=3
        if (/^(\!\=\d)$/.test(rule)) {
          var results = rule.match(/^(\!\=(\d))$/),
              a       = parseInt(results[2]);

          if ((pairs[0] !== a) && (pairs[1] !== a)) {
            traits.pushUnique(trait);
            return;
          }
        }
      });
    });

    return traits;
  },

  // generate pairs
  // https://ghr.nlm.nih.gov/primer/illustrations/chromosomes.jpg
  // this can be customizable later for non-human DNA
  generateDNA: function (gender, father, mother) {
    var chromosomes = humanDNA.chromosomes;

    // specify sex sizes and set data store
    var x     = humanDNA.sex.x,
        y     = humanDNA.sex.y,
        pairs = {},
        size, fatherPair, motherPair;

    // go through each from the template source and generate pairs for rolling
    Object.keys(chromosomes).forEach(function (index) {
      size = chromosomes[index];

      // generate sex chromosomes
      if (size === 'sex') {

        // grab a Y chromosome if we are a male
        if (gender === 'male') {

          // if father's DNA is undefined then we create one
          if (father === undefined) {
            fatherPair = roll.roll('1' + y).result * -1; // make it negative for y
          } else {
            fatherPair = father.DNA[index][0];
          }
        
        // grab a second X chromosome if we are female
        } else {

          // if father's DNA is undefined then we create one
          if (father === undefined) {
            fatherPair = roll.roll('1' + x).result;
          } else {
            fatherPair = father.DNA[index][1];
          }
        }

        // if mother's DNA is undefined then we create one
        if (mother === undefined) {
          motherPair = roll.roll('1' + x).result;
        } else {
          motherPair = mother.DNA[index].sample();
        }
      } else {

        // if father's DNA is undefined then we create one
        if (father === undefined) {
          fatherPair = roll.roll('1' + size).result;
        } else {
          fatherPair = father.DNA[index].sample();
        }

        // if mother's DNA is undefined then we create one
        if (mother === undefined) {
          motherPair = roll.roll('1' + size).result;
        } else {
          motherPair = mother.DNA[index].sample();
        }
      }

      pairs[index] = [fatherPair, motherPair];
    });

    return pairs;
  },

  // generate successor
  generateSuccessor: function (year, options) {
    var generations = options.generations,
        father      = options.father,
        mother      = options.mother;

    return (
      Generator.generate({
        year        : year, 
        gender      : 'male', 
        generations : generations, 
        father      : father,
        mother      : mother,
        successor   : true
      })
    );
  },

  // select successor
  selectSuccessor: function (issue, options) {
    var successor, i;

    // iterate through the children and find an successor
    issue = issue.map(function (child) {
      if (child.gender === 'male') {
        if (successor === undefined) {
          successor = Generator.generateSuccessor(child.birth, options);
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
      issue[0] = Generator.generateSuccessor(issue[0].birth, options);
    }

    // return both
    return issue;
  },

  // generate issue
  generateIssue: function (options) {
    var father         = options.father, 
        mother         = options.mother,
        conceptionYear = mother.birth + 12 + roll.roll('2d6').result;

    // represent children as dice rolls
    var childrenCount = roll.roll('1d6').result,
        rolled        = roll.roll(childrenCount + 'd20'),
        issue         = [];

    // iterate through the rolled children
    rolled.rolled.forEach(function (child) {
      conceptionYear += roll.roll('1d4').result;
      conceptionYear  = Generator.preventImpossibleYear(father.death, roll.roll('2d6').result, conceptionYear);
      issue.push(
        Generator.generate({
          year        : conceptionYear, 
          gender      : ['male', 'female'].sample(), 
          generations : false,
          father      : father,
          mother      : mother
        })
      );
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
    spouse     = Generator.generate({
      year: spouseYear, 
      gender: gender, 
      generations: false, 
      successor: false, 
      spouse: true
    });

    // set marriage
    // todo: look into a better way of doing this
    spouse.marriage = spouse.birth + 10 + roll.roll('1d8').result;

    return spouse;
  },

  // generate zodiac
  generateZodiac: function () {
    var zodiac = roll.roll('1d12').result;

    return zodiac;
  },

  // generate backstory
  generateBackstory: function(person, spouse, father, mother) {
    var genData = require(path.join(dataDir, 'backstory.json')),
        backstory;

    if (father === undefined) father = Generator.generateUnknown();
    if (mother === undefined) mother = Generator.generateUnknown();
    if (spouse === undefined) spouse = Generator.generateUnknown();

    // set the defaults for the text generator
    genData['name']          = [person.name];
    genData['birth_year']    = [person.birth];
    genData['death_year']    = [person.death];
    genData['marriage_year'] = [spouse.marriage];
    genData['father_name']   = [father.name];
    genData['mother_name']   = [mother.name];
    genData['spouse_name']   = [spouse.name];
    textGenerator.genData    = genData;

    // generate the bakstory with the text generator
    backstory = {
      early_life    : textGenerator.generateText('backstory_early_life'),
      career        : textGenerator.generateText('backstory_career'),
      personal_life : textGenerator.generateText('backstory_personal_life'),
      death         : textGenerator.generateText('backstory_death')
    };

    return backstory;
  },

  // generate unknown person
  generateUnknown: function () {
    return {
      name: 'Unknown'
    };
  },

  // generate a person
  generate: function (options) {
    var rolled = roll.roll('2d20'),
        person, age, birth, death, name, issue, DNA, traits, zodiac, backstory;

    // separate out the options
    var year        = options.year, 
        gender      = options.gender, 
        generations = options.generations, 
        successor   = options.successor, 
        spouse      = options.spouse,
        father      = options.father,
        mother      = options.mother;

    
    // set the theme name from the options if we have it
    if (options.theme !== undefined) {
      Generator.themeName = options.theme;
    }

    // set random theme name if we don't have one
    if (Generator.themeName === undefined) {
      Generator.themeName = themes.sample();
    }
    
    Generator.theme = require(path.join(dataDir, Generator.themeName + '.json'));

    // default random year and age
    age = 18 + roll.roll('2d20').result + roll.roll('1d4').result;

    // critical success have higher lifespan
    // critical fail have shorter lifespan
    if (rolled.rolled[0] === 20) {
      age += roll.roll('1d20').result;
    } else if (rolled.rolled[0] === 1) {
      age -= roll.roll('2d4').result; 
    }

    // set the birth and death year
    birth = year;
    death = birth + age;
    
    // default random gender
    if (gender === undefined) {
      gender = 'male';
    }

    // default generations
    if (generations === undefined) {
      generations = 1;
    }

    // generate the DNA, traits and zodiac
    DNA       = Generator.generateDNA(gender, father, mother);
    traits    = Generator.generateTraits(DNA);
    zodiac    = Generator.generateZodiac();

    // generate name
    name = Generator.generateName(gender, false);

    // generate a basic person
    person = {
      id        : md5(gender + birth + death + name + zodiac),
      gender    : gender,
      birth     : birth,
      death     : death,
      age       : age,
      name      : name,
      DNA       : DNA,
      traits    : traits,
      zodiac    : zodiac
    }

    // add successor tag
    if (successor) {
      name = Generator.generateName(gender, true);
      person.successor = true;
      person.name = name;
    }

    // generate a spouse
    if (spouse === undefined) {
      spouse = Generator.generateSpouse(person);
      person.spouse = spouse;
    }

    // generate spouse and successor if we have generations
    if (generations) {

      // generations
      if (generations > 0) {

        // generate issue and successor
        issue = Generator.generateIssue({ 
          father : person, 
          mother : person.spouse 
        });

        person.issue = Generator.selectSuccessor(issue, { 
          generations : generations - 1, 
          father      : person, 
          mother      : person.spouse 
        });
      }
    }

    // generate backstory
    backstory        = Generator.generateBackstory(person, spouse, father, mother);
    person.backstory = backstory;

    return person;
  }
}

module.exports = Generator;
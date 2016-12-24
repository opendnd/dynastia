var questions     = require('questions'),
    colors        = require('colors/safe'),
    path          = require('path'),
    Roll          = require('roll'),
    roll          = new Roll(),
    rootDir       = path.join(__dirname, '..'),
    tmpDir        = path.join(rootDir, 'tmp'),
    libDir        = path.join(rootDir, 'lib'),
    dataDir       = path.join(libDir, 'data'),
    Generator     = require(path.join(libDir, 'generator')),
    Renderer      = require(path.join(libDir, 'renderer')),
    themes        = require(path.join(dataDir, 'themes.json')),
    fs            = require('fs'),
    logo          = fs.readFileSync(rootDir + '/logo.txt', { encoding: 'utf-8' }),
    output, dynasty;

function wizard (output) {

  // default output folder
  if (output === undefined) {
    output = '.';
  }

  // output welcome
  console.log('\n' + colors.cyan(logo) + '\n');

  // ask a few questions
  questions.askMany({
    theme: { 
      info: colors.cyan('What type of dynasty is this inspired on?') + colors.white(' (' + themes.join(' | ') + ')'),
      required: false
    },

    generations: {
      info: colors.cyan('How many generations are there?'),
      required: false
    },

    year: {
      info: colors.cyan('What year did the dynasty begin?'),
      required: false
    }
  }, function(result){

    // set defaults for the answers
    result.theme       = result.theme.toLowerCase();
    result.generations = parseInt(result.generations);
    result.year        = parseInt(result.year);

    if (themes.indexOf(result.theme) < 0) {
      result.theme = themes[0];
    }

    if (!result.generations > 0) {
      result.generations = 1;
    }

    if (isNaN(result.year)) {
      result.year = new Date().getFullYear() - roll.roll('12d100').result;
    }

    // output the dynasty
    Generator.themeName = result.theme;
    dynasty = Generator.generate(result.year, 'male', result.generations);
    Renderer.dynasty(dynasty);

    // save the file or not into a *.dyn file
    questions.askOne({ info: colors.cyan('Would you like to save your dynasty? (y | n)') }, function(result){
      if (result === 'y' || result === 'yes') {
        var filename = new Date().getTime() + '.dyn',
            filepath = path.join(output, filename);

        // write the file
        fs.writeFileSync(filepath, JSON.stringify(dynasty));
        output = colors.green('Saving... ' + filepath);
      } else {
        output = colors.white('Exited without save.');
      }

      console.log(output);
    });
  });
}

module.exports = wizard;
const fs = require('fs');
const questions = require('questions');
const colors = require('colors/safe');
const path = require('path');
const rootDir = path.join(__dirname, '..');
const libDir = path.join(rootDir, 'lib');
const logo = fs.readFileSync(path.join(rootDir, 'logo.txt'), { encoding: 'utf-8' });
const Dynastia = require(path.join(libDir, 'dynastia'));
const defaults = require(path.join(libDir, 'defaults'));
const Renderer = require(path.join(libDir, 'renderer'));
const Saver = require(path.join(libDir, 'saver'));

const wizard = (outputDir) => {
  if (outputDir === undefined) outputDir = '.';

  // output welcome
  process.stdout.write(`\n${colors.cyan(logo)}\n`);

  // ask a few questions
  questions.askMany({
    theme: {
      info: colors.cyan('What culture theme is this dynasty?') + colors.white(` (${defaults.themes.join(' | ')})`),
      required: false,
    },

    race: {
      info: colors.cyan('What race this dynasty?') + colors.white(` (${defaults.races.join(' | ')})`),
      required: false,
    },

    generations: {
      info: colors.cyan('How many target generations are there?'),
      required: false,
    },

    startingYear: {
      info: colors.cyan('What year did this dynasty begin?'),
      required: false,
    },

    yearFormat: {
      info: colors.cyan('What format for years do you want to use? Default: BCE/CE'),
      required: false,
    },
  }, (opts) => {
    const dynastia = new Dynastia(opts);
    const dynasty = dynastia.generate();

    Renderer.output(dynasty);
    Saver.finish(outputDir, 'Would you like to save your dynasty? (y | n)', dynasty, dynasty.name);
  });
};

module.exports = wizard;

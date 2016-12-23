#!/usr/bin/env node

// module dependencies
var program   = require('commander'),
    colors    = require('colors/safe'),
    pinfo     = require('../package.json'),
    wizard    = require('./wizard'),
    loader    = require('./loader'),
    path      = require('path'),
    rootDir   = path.join(__dirname, '..'),
    fs        = require('fs');

// program basics
program
  .version(pinfo.version, '-v, --version')
  .description(pinfo.description)
  .option('-i, --input <file>', 'input *.dyn file')
  .option('-o, --output <dir>', 'output directory')
  .parse(process.argv);

// load a file or go through the wizard
if (program.input) {
  loader(program.input);
} else {
  wizard(program.output);
}

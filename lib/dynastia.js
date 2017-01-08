#!/usr/bin/env node

// module dependencies
var fs        = require('fs'),
    program   = require('commander'),
    colors    = require('colors/safe'),
    pinfo     = require('../package.json'),
    wizard    = require('./wizard'),
    loader    = require('./loader'),
    server    = require('./server'),
    path      = require('path'),
    rootDir   = path.join(__dirname, '..'),
    libDir    = path.join(rootDir, 'lib'),
    Renderer  = require(path.join(libDir, 'renderer')),
    dynasty;

// program basics
program
  .version(pinfo.version, '-v, --version')
  .description(pinfo.description)
  .option('-i, --input <file>', 'input *.dyn file')
  .option('-o, --output <dir>', 'output directory')
  .option('-s, --server', 'launch a server based on an input')
  .parse(process.argv);

// load a file or go through the wizard
if (program.input) {
  if (program.server) {
    server(program.input);
  } else {
    dynasty = loader(program.input);
    if (dynasty) Renderer.dynasty(dynasty);
  }
} else {
  wizard(program.output);
}

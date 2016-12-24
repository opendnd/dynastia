# Dynastia

[![NPM](https://nodei.co/npm/dynastia.png?downloads=true&stars=true)](https://nodei.co/npm/dynastia/) 

[![Build Status](https://travis-ci.org/opendnd/dynastia.svg?branch=master)](https://travis-ci.org/opendnd/dynastia) [![Join the chat at https://gitter.im/opendnd/dynastia](https://badges.gitter.im/opendnd/dynastia.svg)](https://gitter.im/opendnd/dynastia?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

This is a tool for D&D DM's to generate dynasties quickly when making a kingdom's history.

![demo](doc/demo.gif)

## Installation

You will need [node](https://nodejs.org/en/) and [npm](https://www.npmjs.com/) installed. Then do:

`npm install -g dynastia`

## Loading saved files

Once you have saved a file you can load it again.

`dynastia -i my-file.dyn`

## Changing the output directory

You can specify a specific output directory, otherwise it will save to `pwd`.

`dynastia -o my/output/dir`
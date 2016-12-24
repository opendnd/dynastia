var colors        = require('colors/safe'),
    prettyjson    = require('prettyjson'),
    hr            = '---------------------------------------------',
    renderOptions = { 
      numberColor: 'cyan', 
      stringColor: 'white', 
      keysColor: 'yellow' 
    },
    prev;

var renderer = {
  person: function (person) {
    console.log(colors.white('\n' + hr + '\nPERSON: \n' + hr));
    console.log(prettyjson.render(person, renderOptions));
    console.log(colors.white(hr + '\n'));
  },

  walkDynasty: function (dynasty, first) {
    if (first === undefined) {
      first = true;
    }

    var name = dynasty.name + ' (' + dynasty.birth + ' - ' + dynasty.death + ')'

    // output the beginning or continue with the next
    if (first) {
      console.log(colors.white('Dynasty begins with: '));
      console.log('\t' + colors.cyan.underline.bold(name));
    } else {
      console.log(colors.white('\nFollowed by: '));
      console.log('\t' + colors.yellow.underline.bold(name) + colors.white(' son of ') + colors.cyan.underline.bold(prev));
    }

    // continue w/ the successor if we have it
    if (dynasty.successor) {
      prev = name;
      renderer.walkDynasty(dynasty.successor, false);
    }
  },

  dynasty: function (dynasty) {
    console.log(colors.white('\n' + hr + '\nDYNASTY: \n' + hr));
    renderer.walkDynasty(dynasty);
    console.log(colors.white(hr + '\n'));
  }
}

module.exports = renderer;
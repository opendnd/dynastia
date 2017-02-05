// Originally written and released to the public domain by drow <drow@bin.sh>
// http://creativecommons.org/publicdomain/zero/1.0/

var TextGenerator = function () {
  this.genData = {};

  // text generator function
  this.generateText = function (type) {
    var list;

    if (list = this.genData[type]) {
      var string;

      if (string = this.selectFrom(list)) {
        return this.expandTokens(string);
      }
    }

    return '';
  }

  // generate multiple texts
  this.generateList = function (type, nOf) {
    var list = [],
        i;

    for (i = 0; i < nOf; i++) {
      list.push(this.generateText(type));
    }

    return list;
  }

  // select from list
  this.selectFrom = function (list) {
    if (list.constructor == Array) {
      return this.selectFromArray(list);
    } else {
      return this.selectFromTable(list);
    }
  }

  this.selectFromArray = function (list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  this.selectFromTable = function (list) {
    var len;

    if (len = this.scaleTable(list)) {
      var idx = Math.floor(Math.random() * len) + 1,
          key;

      for (key in list) {
        var r = this.keyRange(key);
        if (idx >= r[0] && idx <= r[1]) { return list[key]; }
      }
    }

    return '';
  }

  this.scaleTable = function (list) {
    var len = 0,
        key;

    for (key in list) {
      var r = this.keyRange(key);
      if (r[1] > len) { len = r[1]; }
    }

    return len;
  }

  this.keyRange = function (key) {
    var match;

    if (match = /(\d+)-00/.exec(key)) {
      return [ parseInt(match[1]), 100 ];
    } else if (match = /(\d+)-(\d+)/.exec(key)) {
      return [ parseInt(match[1]), parseInt(match[2]) ];
    } else if (key == '00') {
      return [ 100, 100 ];
    } else {
      return [ parseInt(key), parseInt(key) ];
    }
  }

  // expand {token} in string
  this.expandTokens = function (string) {
    var match;

    while (match = /{(\w+)}/.exec(string)) {
      var token = match[1],
          repl;

      if (repl = this.generateText(token)) {
        string = string.replace('{'+token+'}',repl);
      } else {
        string = string.replace('{'+token+'}',token);
      }
    }
    return string;
  }
}

module.exports = TextGenerator;
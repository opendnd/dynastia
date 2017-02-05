// Originally written and released to the public domain by drow <drow@bin.sh>
// http://creativecommons.org/publicdomain/zero/1.0/

var NameGenerator = function () {
  this.nameSet    = {};
  this.chainCache = {};

  // name generator function
  this.generateName = function (type) {
    var chain; 

    if (chain = this.markovChain(type)) {
      return this.markovName(chain);
    }

    return '';
  };

  // generate multiple names
  this.nameList = function (type, nOf) {
    var list = [],
        i;

    for (i = 0; i < nOf; i++) {
      list.push(this.generateName(type));
    }

    return list;
  };

  // get markov chain by type
  this.markovChain = function (type) {
    var chain; 

    if (chain = this.chainCache[type]) {
      return chain;
    } else {
      var list; 

      if (list = this.nameSet[type]) {
        var chain;

        if (chain = this.constructChain(list)) {
          this.chainCache[type] = chain;
          return chain;
        }
      }
    }

    return false;
  };

  // construct markov chain from list of names
  this.constructChain = function (list) {
    var chain = {},
        i;

    for (i = 0; i < list.length; i++) {
      var names = list[i].split(/\s+/);
      chain = this.incrChain(chain,'parts',names.length);
      var j; 

      for (j = 0; j < names.length; j++) {
        var name = names[j];
        chain = this.incrChain(chain,'nameLen',name.length);

        var c = name.substr(0,1);
        chain = this.incrChain(chain,'initial',c);

        var string = name.substr(1),
            lastC  = c;

        while (string.length > 0) {
          var c = string.substr(0,1);
          chain = this.incrChain(chain,lastC,c);

          string = string.substr(1);
          lastC  = c;
        }
      }
    }

    return this.scaleChain(chain);
  };

  this.incrChain = function (chain, key, token) {
    if (chain[key]) {
      if (chain[key][token]) {
        chain[key][token]++;
      } else {
        chain[key][token] = 1;
      }
    } else {
      chain[key] = {};
      chain[key][token] = 1;
    }

    return chain;
  };

  this.scaleChain = function (chain) {
    var tableLen = {},
        key;

    for (key in chain) {
      tableLen[key] = 0;
      var token;

      for (token in chain[key]) {
        var count    = chain[key][token],
            weighted = Math.floor(Math.pow(count,1.3));

        chain[key][token] = weighted;
        tableLen[key]    += weighted;
      }
    }

    chain['tableLen'] = tableLen;
    
    return chain;
  };

  // construct name from markov chain
  this.markovName = function (chain) {
    var parts = this.selectLink(chain,'parts'),
        names = [],
        i; 

    for (i = 0; i < parts; i++) {
      var nameLen = this.selectLink(chain, 'nameLen'),
          c       = this.selectLink(chain, 'initial'),
          name    = c,
          lastC   = c;

      while (name.length < nameLen) {
        c     = this.selectLink(chain, lastC);
        name += c;
        lastC = c;
      }

      names.push(name);
    }
    return names.join(' ');
  };

  this.selectLink = function (chain, key) {
    var len = chain['tableLen'][key],
        idx = Math.floor(Math.random() * len),
        t   = 0;

    for (token in chain[key]) {
      t += chain[key][token];
      if (idx < t) { return token; }
    }

    return '-';
  };
}

module.exports = NameGenerator;
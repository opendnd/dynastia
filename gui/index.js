const {ipcRenderer, clipboard} = require('electron');

var selectedType = 'medieval',
    generations, year, dynasty, prev, copiedText;

function resetAllButtons () {
  document.getElementById('medieval').className  = '';
  document.getElementById('classical').className = '';
  document.getElementById('asian').className     = '';
}

function selectOption (button) {
  resetAllButtons();
  document.getElementById(button).className = 'active';
  selectedType = button;
}

function generateResults (cb) {
  dynasty = ipcRenderer.sendSync('generate', { 
    theme: selectedType,
    generations: generations,
    year: year
  });

  cb();
}

function nextStep (step) {
  if (step === 1) {
    document.getElementById('home').className        = '';
    document.getElementById('generations').className = 'active';
  } else if (step === 2) {
    var valid = true,
        error;

    // check generations
    if (!isNaN(parseInt(document.getElementById('inputGen').value))) {
      generations = parseInt(document.getElementById('inputGen').value);

      if (generations > 100) {
        valid = false;
        error = 'Please enter a generations amount less than 100';
      }

      if (generations <= 0) {
        valid = false;
        error = 'Please enter a positive number for generations amount';
      }
    } else {
      valid = false;
      error = 'Please enter a value for generations amount';
    }

    // check year
    if (!isNaN(parseInt(document.getElementById('inputYear').value))) {
      year = parseInt(document.getElementById('inputYear').value);
    } else {
      valid = false;
      error = 'Please enter a value for year';
    }

    // check if the form values are valid
    if (valid) {
      generateResults (function () {
        document.getElementById('generations').className = '';
        document.getElementById('results').className     = 'active';
        renderDynasty('', dynasty);
        copiedText = document.getElementById('content').innerText;
      });
    } else {
      alert(error);
    }
  } else if (step === 0) {
    selectOption('medieval');
    document.getElementById('inputGen').value    = '';
    document.getElementById('inputYear').value   = '';
    document.getElementById('results').className = '';
    document.getElementById('home').className    = 'active';
  }
}

// get the successor from the person
function getSuccessor (person) {
  var successor;

  // get the successor if we can
  if (person.issue !== undefined) {
    person.issue.forEach(function (child) {
      if (child.successor) {
        successor = child;
      }
    });
  }

  return successor;
}

// determine if there is a successor or not
function hasSuccessor (person) {
  if (getSuccessor(person) === undefined) {
    return false;
  } else {
    return true;
  }
}

// render a year
function renderYear (year) {
  if (year >= 0) {
    return year + ' CE';
  } else {
    return Math.abs(year) + ' BCE'
  }
}

function renderName (person, father) {
  var output    = '',
      className = 'person';

  if (father === undefined) {
    father = false;
  }

  if (father) {
    className = 'father';
  }

  output += '<span class="' + className + '">' + person.name + '</span> <span class="year">(' + renderYear(person.birth) + ' - ' + renderYear(person.death) + ')</span>';

  return output;
}

function renderDynasty (html, dynasty, first) {
  if (html === undefined) {
    html = '';
  }

  if (first === undefined) {
    first = true;
  }

  if (dynasty === undefined) {
    return html;
  }

  html += '<p>';
  html += renderName(dynasty);

  if (!first) {
    html += ' son of ' + renderName(prev, true);
  }

  html += '</p>';

  // continue w/ the successor if we have it
  if (hasSuccessor(dynasty)) {
    prev = dynasty;
    renderDynasty(html, getSuccessor(dynasty), false);
  } else {
    document.getElementById('content').innerHTML = html;
  }
}

function copyToClipboard () {
  clipboard.writeText(copiedText);
  alert('Successfully copied your dynasty to the clipboard');
}

function exportToPDF () {
  alert('Sorry, this feature is not yet supported');
}
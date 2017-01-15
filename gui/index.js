const {ipcRenderer, clipboard} = require('electron');
const path = require('path');
var rootDir, libDir, 
    selectedType = 'medieval',
    selectedType, generations, year, 
    dynasty, prev, copiedText;
    
// load from within the directory if debugging or get from node modules
if (process.env.DYNASTIA_DEBUG) {
  rootDir = path.join(__dirname, '..');  
  libDir  = path.join(rootDir, 'lib');
} else {
  rootDir = path.join(__dirname, '.'),
  libDir  = path.join(rootDir, 'node_modules', 'dynastia', 'lib'); 
}

var Renderer = require(path.join(libDir, 'renderer'));

ipcRenderer.on('start-pdf', function (event, arg) {
  startLoading();
});

ipcRenderer.on('finish-pdf', function (event, arg) {
  endLoading();
  setTimeout(function () {
    alert('Your PDF has been successfully saved');
  }, 100);
});

function startLoading () {
  document.getElementById('loader').className = 'active';
}

function endLoading () {
  document.getElementById('loader').className = '';
}

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
  startLoading();
  dynasty = ipcRenderer.sendSync('generate', { 
    theme: selectedType,
    generations: generations,
    year: year
  });
  endLoading();
  cb();
}

function nextStep (step) {
  if (step === 1) {
    document.getElementById('home').className        = '';
    document.getElementById('generations').className = 'active';

    // make testing the form easier
    if (process.env.DYNASTIA_DEBUG) {
      document.getElementById('inputGen').value  = 5;
      document.getElementById('inputYear').value = 1066;
    }
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

        Renderer.renderDynasty('', dynasty, true, function (html) {
          document.getElementById('content').innerHTML = html;
          document.getElementById('content').scrollTop = 0;
          copiedText = document.getElementById('content').innerText;
        });
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

function copyToClipboard () {
  clipboard.writeText(copiedText);
  alert('Successfully copied your dynasty to the clipboard');
}

function exportToPDF () {
  ipcRenderer.send('pdf');
}

var selectedType = 'medieval',
    generations, year;

function resetAllButtons () {
  document.getElementById('medieval').className = '';
  document.getElementById('classical').className = '';
  document.getElementById('asian').className = '';
}

function selectOption (button) {
  resetAllButtons();
  document.getElementById(button).className = 'active';
  selectedType = button;
}

function generateResults (cb) {
  console.log(selectedType, generations, year);
  cb();
}

function nextStep (step) {
  if (step === 1) {
    document.getElementById('home').className = '';
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
        document.getElementById('results').className = 'active';
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
  console.log('Copying to clipboard');
}

function exportToPDF () {
  console.log('Exporting to PDF');
}
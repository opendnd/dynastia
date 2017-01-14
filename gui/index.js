var selectedType = 'medieval';

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

function nextStep (step) {
  if (step === 1) {
    document.getElementById('home').className = '';
    document.getElementById('generations').className = 'active';
  } else if (step === 2) {
    document.getElementById('generations').className = '';
    document.getElementById('results').className = 'active';
  } else if (step === 0) {
    document.getElementById('results').className = '';
    document.getElementById('home').className = 'active';
  }
}

function copyToClipboard () {
  console.log('Copying to clipboard');
}

function exportToPDF () {
  console.log('Exporting to PDF');
}
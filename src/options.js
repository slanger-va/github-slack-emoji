document.getElementById('clear').addEventListener('click', () => {
  chrome.extension.sendMessage({ name: 'CLEAR_STATE' }, function(response) {
      localStorage.removeItem('slackToken');
      localStorage.setItem('fontSize', 28);
      alert('Data cleared!'); // eslint-disable-line
  });
}, false);

document.getElementById('fontSize').value = localStorage.getItem('fontSize');

document.getElementById('fontSizeButton').addEventListener('click', () => {
  fontsize = document.getElementById('fontSize').value;
  if (fontsize && fontsize > 0) {
    chrome.extension.sendMessage({setFontSize: fontsize}, function(response) {
      localStorage.setItem('fontSize', fontsize);
    });
  }
}, false);

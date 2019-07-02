document.getElementById('fontSize').value = localStorage.getItem('fontSize');
document.getElementById('shortcut').value = String.fromCharCode(parseInt(localStorage.getItem('shortcut')));


let searchToggle = document.getElementById('useSearchCheckBox');
searchToggle.checked = !!localStorage.getItem('useSearch') && localStorage.getItem('useSearch') !== "false";


document.getElementById('clear').addEventListener('click', () => {
  chrome.extension.sendMessage({ name: 'CLEAR_STATE' }, function() {
      localStorage.removeItem('slackToken');
      localStorage.setItem('fontSize', 28);
      alert('Data cleared!'); // eslint-disable-line
  });
}, false);

document.getElementById('fontSizeButton').addEventListener('click', () => {
  const fontsize = document.getElementById('fontSize').value;
  if (fontsize && fontsize > 0) {
    chrome.extension.sendMessage({setFontSize: fontsize}, function() {
      localStorage.setItem('fontSize', fontsize);
    });
  }
}, false);

searchToggle.addEventListener('click', () => {
    searchToggle = document.getElementById('useSearchCheckBox');
    localStorage.setItem('useSearch', searchToggle.checked);
    chrome.extension.sendMessage({setUseSearch: searchToggle.checked});
}, false);

document.getElementById('shortcutButton').addEventListener('click', () => {
  const shortcut = document.getElementById('shortcut').value || ':';
  chrome.extension.sendMessage({setShortcut:  shortcut.charCodeAt(0)}, function() {
    localStorage.setItem('shortcut', shortcut.charCodeAt(0).toString());
  });
}, false);

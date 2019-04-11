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

let searchToggle = document.getElementById('useSearchCheckBox');
searchToggle.checked = !!localStorage.getItem('useSearch') && localStorage.getItem('useSearch') !== "false";
searchToggle.addEventListener('click', () => {
    searchToggle = document.getElementById('useSearchCheckBox');
    localStorage.setItem('useSearch', searchToggle.checked);
    chrome.extension.sendMessage({setUseSearch: searchToggle.checked});
}, false);

document.getElementById('shortcutButtton').addEventListener('click', () => {
  shortcut = document.getElementById('shortcut').value || ':';
  if (shortcut && shortcut > 0) {
    chrome.extension.sendMessage({setShortcut: shortcut}, function(response) {
      localStorage.setItem('shortcut', shortcut);
    });
  }
}, false);

document.getElementById('clear').addEventListener('click', () => {
  chrome.extension.sendMessage({ name: 'CLEAR_STATE' }, (response) => {
      sessionStorage.removeItem('slackToken');
      localStorage.removeItem('slackToken');
      alert('Data cleared!'); // eslint-disable-line
  });
}, false);

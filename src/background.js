chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {

  if (request.name === 'setLoginCookie') {
    var obj = {slackToken: window.slackToken};
    chrome.storage.sync.set(obj, function() {
      console.log('Data saved');
    });
  }

  if (request.name === 'getLoginCookie') {
    chrome.storage.sync.get('slackToken', function(data) {
      console.log(data);
      sendResponse({ slackToken: data['slackToken'] });
    })
  }
  return true;

});


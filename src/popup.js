chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.name === 'CLEAR_STATE') {
    localStorage.removeItem('slackToken');
    localStorage.setItem('fontSize', 28)
  }
});

function setCookie(){
  chrome.extension.sendMessage({name: 'setLoginCookie'}, function(otherResponse) {})
}

function getFontSize(){
  chrome.extension.sendMessage({name: 'getFontSize'}, function(response) {
    if(response['fontSize']) {
      localStorage.setItem('fontSize', response['fontSize'])
    }
  })
}

function getCookie(){
  chrome.extension.sendMessage({name: 'getLoginCookie'}, function(response) {
    if( response['slackToken']) {
      localStorage.setItem('slackToken', response['slackToken'])
    } else {
      let tk = authenticateTeam();
      if(tk) {
        localStorage.setItem('slackToken', tk['slackToken'])
      }
      window.close();
    }
  })
}

function authenticateTeam() {
  chrome.extension.sendMessage({name: 'authenticateTeam'}, function (otherResponse) {
  })
}

function getSlackInfo(){
  chrome.extension.sendMessage({name: 'getSlackApi'}, function(response) {
    var slackApi = response['slackApi'];
    localStorage.setItem('clientId', slackApi['clientId']);
    localStorage.setItem('clientSecret', slackApi['clientSecret']);
    localStorage.setItem('redirectUri', slackApi['redirectUri']);
    localStorage.setItem('scope', slackApi['scope']);
  })
}

getCookie();
getSlackInfo();
getFontSize();

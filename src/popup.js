function setCookie(){
  chrome.extension.sendMessage({name: 'setLoginCookie'}, function(otherResponse) {})
}

function getCookie(){
  chrome.extension.sendMessage({name: 'getLoginCookie'}, function(response) {
    if( response['slackToken']) {
      sessionStorage.setItem('slackToken', response['slackToken'])
    } else {
      let tk = authenticateTeam();
      sessionStorage.setItem('slackToken', tk['slackToken'])
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
    sessionStorage.setItem('clientId', slackApi['clientId']);
    sessionStorage.setItem('clientSecret', slackApi['clientSecret']);
    sessionStorage.setItem('redirectUri', slackApi['redirectUri']);
    sessionStorage.setItem('scope', slackApi['scope']);
  })
}

getCookie();
getSlackInfo();

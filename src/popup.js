function setCookie(){
  chrome.extension.sendMessage({name: 'setLoginCookie'}, function(otherResponse) {})
}

function getCookie(){
  chrome.extension.sendMessage({name: 'getLoginCookie'}, function(response) {
    console.log(response);
    sessionStorage.setItem('slackToken', response['slackToken'])
  })
}

setCookie();
getCookie();

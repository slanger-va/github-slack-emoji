chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.name === 'setLoginCookie') {
    var obj = {slackToken: localStorage.getItem('slackToken')};
    chrome.storage.sync.set(obj, function() {});
  }

  if (request.name === 'getLoginCookie') {
    chrome.storage.sync.get('slackToken', function(data) {
      if (data['slackToken']) {
        sendResponse({slackToken: data['slackToken']});
      } else {
        sendResponse({slackToken: localStorage.getItem('slackToken')});
      }
    })
  }

  if (request.name === 'getSlackApi') {
    let slack = {
        clientId: localStorage.getItem('clientId'),
        clientSecret: localStorage.getItem('clientSecret'),
        redirectUri: localStorage.getItem('redirectUri'),
        scope: localStorage.getItem('scope'),
    };
    sendResponse({ slackApi: slack});
  }

  if (request.name === 'authenticateTeam') {
    authenticateTeam();
    chrome.storage.sync.get('slackToken', function(data) {
      if (data['slackToken']) {
        sendResponse({slackToken: data['slackToken']});
      } else {
        sendResponse({slackToken: localStorage.getItem('slackToken')});
      }
    })
  }

  if (request.name === 'getFontSize') {
    sendResponse({fontSize: localStorage.getItem('fontSize')});
  }

  if (request.name === 'getUseSearch') {
    sendResponse({useSearch: localStorage.getItem('useSearch') || true});
  }

  if(request.name === 'CLEAR_STATE'){
    chrome.storage.sync.remove('slackToken');
    localStorage.removeItem('slackToken');
    localStorage.setItem('fontSize', 28);
    sendResponse({ok: true});
  }

  if(request.setFontSize) {
    localStorage.setItem('fontSize', request.setFontSize);
    sendResponse({ok: true});
  }

  if(request.setUseSearch) {
    localStorage.setItem('useSearch', request.setUseSearch);
    sendResponse({ok: true});
  }

  return true;
});

clientId = localStorage.getItem('clientId');
clientSecret = localStorage.getItem('clientSecret');
redirectUri = localStorage.getItem('redirectUri');
scope = localStorage.getItem('scope');
var AUTHORIZE_URL = 'https://slack.com/oauth/authorize';
var ACCESS_URL = 'https://slack.com/api/oauth.access';

function buildAccessUrl(clientId, clientSecret, redirectUri, code) {
  return `${ACCESS_URL}?client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${redirectUri}&code=${code}`
}

function buildAuthorizeUrl(clientId, scope, redirectUri) {
  return `${AUTHORIZE_URL}?client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}`
}

function authenticateTeam() {
  // Run Chrome's auth flow and get a token
  try {
      const token = new Promise((resolve, reject) => (
        chrome.identity.launchWebAuthFlow({
          url: buildAuthorizeUrl(clientId, scope, redirectUri),
          interactive: true,
        }, (redirectUrl) => {
          // Get the query params from the provided redirect URL
          // const {query} = parse(redirectUrl, true);
          url = redirectUrl.split("?");
          params = url[1].split("&");
          let code = '';
          if (params) {
            params.forEach(function (element) {
              if (element.indexOf('code=') === 0) {
                code = element.split("=")[1];
              }
            });
          }

          const accessUrl = buildAccessUrl(clientId, clientSecret, redirectUri, code);
          // Resolve with the access token, or reject on error
          fetch(accessUrl)
            .then(response => response.json())
            .then(json => json.access_token)
            .then(resolve)
            .catch(reject);
        })
      )).then(tk=> {
        localStorage.setItem('slackToken', tk);
        chrome.storage.sync.set({'slackToken': tk}, function() {});
      });
  } catch (error) {
    const {message} = error;
    alert('failed to log in.')
  }
}


chrome.commands.onCommand.addListener(function(command) {
  console.log('Command:', command);
  if (command === "show-emoji-search-dialog" ){
    //Toggle search
  }
});


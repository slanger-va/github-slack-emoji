chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.name === 'setLoginCookie') {
    var obj = {slackToken: sessionStorage.getItem('slackToken')};
    chrome.storage.sync.set(obj, function() {});
  }

  if (request.name === 'getLoginCookie') {
    chrome.storage.sync.get('slackToken', function(data) {
      if (data['slackToken']) {
        sendResponse({slackToken: data['slackToken']});
      } else {
        sendResponse({slackToken: sessionStorage.getItem('slackToken')});
      }
    })
  }

  if (request.name === 'getSlackApi') {
    let slack = {
        clientId: sessionStorage.getItem('clientId'),
        clientSecret: sessionStorage.getItem('clientSecret'),
        redirectUri: sessionStorage.getItem('redirectUri'),
        scope: sessionStorage.getItem('scope'),
    };
    sendResponse({ slackApi: slack});
  }

  if (request.name === 'authenticateTeam') {
    authenticateTeam();
    chrome.storage.sync.get('slackToken', function(data) {
      if (data['slackToken']) {
        sendResponse({slackToken: data['slackToken']});
      } else {
        sendResponse({slackToken: sessionStorage.getItem('slackToken')});
      }
    })
  }

  if(request.name === 'CLEAR_STATE'){
    chrome.storage.sync.remove('slackToken');
    sessionStorage.removeItem('slackToken');
    localStorage.removeItem('slackToken');
    sendResponse({ok: true});
  }

  return true;
});

clientId = sessionStorage.getItem('clientId');
clientSecret = sessionStorage.getItem('clientSecret');
// redirectUri = chrome.identity.getRedirectURL();
redirectUri = sessionStorage.getItem('redirectUri');
scope = sessionStorage.getItem('scope');
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
        sessionStorage.setItem('slackToken', tk);
        chrome.storage.sync.set({'slackToken': tk}, function() {});
      });
    // yield put(teamActions.authenticated({ token }));
  } catch (error) {
    // Authentication error
    const {message} = error;
    // yield put(teamActions.authenticated({ message }, true));
  }
}


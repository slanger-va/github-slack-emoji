document.addEventListener("keydown", keyDownTextField, false);
var textareas = document.getElementsByName('pull_request[body]');

function keyDownTextField(e) {
  for (var i = 0, l = textareas.length; i < l; i++) {
    if (textareas[i].value) {
      textareas[i].value = convertString(textareas[i].value);
    }
  }
}

const Http = new XMLHttpRequest();
const url='https://slack.com/api/emoji.list?token=' + window.slackToken;
Http.open("GET", url);
Http.send();
const emojiMap = new Map();
Http.onreadystatechange=(e)=> {
  if (!Http.responseText) {return}
  const text = JSON.parse(Http.responseText);
  const emoji = text.emoji;
  for(let key in emoji) {
    if (key.includes('alias:')) {
      key = key.replace('alias:', '');
    }
    emojiMap.set(key, emoji[key]);
  }
  // setCookie()
};

// function setCookie(){
//   chrome.extension.sendMessage({name: 'setLoginCookie'}, function(otherResponse) {
//     console.log(otherResponse)
//   })
// }

// function getCookie(){
//   chrome.extension.sendMessage({name: 'getLoginCookie'}, function(response) {
//     console.log(response);
//     alert(response)
//   })
// }

function convertString(v) {
  if (emojiMap && emojiMap != null) {
    if (v) {
      var emojiStrings = v.match(':.*:');
      for (var i = 0; i < emojiStrings.length; i++) {
        v = v.replace(emojiStrings[i], emojiMap[emojiStrings[i]]);
      }
    }
  }
  return v;
}



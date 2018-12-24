var textareas = document.getElementsByName('pull_request[body]');
var commentareas = document.getElementsByName('comment[body]');
var issueareas = document.getElementsByName('issue_comment[body]');
document.addEventListener("keydown", keyDownTextField, false);


function getCookie(){
  chrome.extension.sendMessage({name: 'getLoginCookie'}, function(response) {
    if( response['slackToken']) {
      localStorage.setItem('slackToken', response['slackToken'])
    }
  })
}

function getFontSize(){
  chrome.extension.sendMessage({name: 'getFontSize'}, function(response) {
    if( response['fontSize']) {
      localStorage.setItem('fontSize', response['fontSize'])
    }
  })
}

function keyDownTextField(e) {
  for (var i = 0, l = textareas.length; i < l; i++) {
    if (textareas[i].value) {
      textareas[i].value = convertString(textareas[i].value);
    }
  }
  for (var i = 0, l = commentareas.length; i < l; i++) {
    if (commentareas[i].value) {
      commentareas[i].value = convertString(commentareas[i].value);
    }
  }
  for (var i = 0, l = issueareas.length; i < l; i++) {
    if (issueareas[i].value) {
      issueareas[i].value = convertString(issueareas[i].value);
    }
  }
}

const Http = new XMLHttpRequest();
const url='https://slack.com/api/emoji.list?token=' + localStorage.getItem('slackToken');
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
};

function convertString(v) {
  if (emojiMap && emojiMap != null) {
    if (v) {
      var emojiStrings = v.match(':.*:');
      if (emojiStrings) {
        for (var i = 0; i < emojiStrings.length; i++) {
          emoji = emojiStrings[i];
          while( emoji.includes(':')) {
            firstIndex = emoji.indexOf(':');
            newemoji = emoji.replace(':', '');
            secondIndex = newemoji.indexOf(':');
            newemoji = newemoji.substring(firstIndex,secondIndex);
            slackEmoji = emojiMap.get(newemoji);
            if (slackEmoji) {
              imageString = '<img src="'+slackEmoji+'" height="'+localStorage.getItem('fontSize')+'">';
              v = v.replace(':'+newemoji+':', imageString);
            }
            emoji = emoji.replace(':', '');
          }
        }
      }
    }
  }
  return v;
}

getCookie();
getFontSize();



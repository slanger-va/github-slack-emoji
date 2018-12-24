document.addEventListener("keydown", keyDownTextField, false);
var textareas = document.getElementsByName('pull_request[body]');
var fontSize = 28;

function getCookie(){
  chrome.extension.sendMessage({name: 'getLoginCookie'}, function(response) {
    if( response['slackToken']) {
      sessionStorage.setItem('slackToken', response['slackToken'])
    } else {

    }
  })
}

function keyDownTextField(e) {
  for (var i = 0, l = textareas.length; i < l; i++) {
    if (textareas[i].value) {
      textareas[i].value = convertString(textareas[i].value);
    }
  }
}

const Http = new XMLHttpRequest();
const url='https://slack.com/api/emoji.list?token=' + sessionStorage.getItem('slackToken');
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
            emoji = emoji.replace(':', '');
          }
          slackEmoji = emojiMap.get(emoji);
          if (slackEmoji) {
            imageString = '<img src="'+slackEmoji+'" height="'+fontSize+'">';
            v = v.replace(emojiStrings[i], imageString);
          }
        }
      }
    }
  }
  return v;
}

getCookie();



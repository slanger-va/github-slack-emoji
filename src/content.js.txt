import * as creds from "../creds";

var size = 16;
const emojiMap = new Map();

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
const url='https://slack.com/api/emoji.list?token=' + creds.token;
Http.open("GET", url);
Http.send();
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
          var str = emojiStrings[i].replace(/:/g, '');
          if (emojiMap.get(str)) {

            var slackImageString = '<img src='+ emojiMap.get(str)+ ' height='+size+'>';
            v = v.replace(emojiStrings[i], slackImageString);
          }
        }
      }
    }
  }
  return v;
}



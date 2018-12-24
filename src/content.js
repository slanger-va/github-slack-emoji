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
  allArray = textareas.concat(commentareas);
  allArray = allArray.concat(issueareas);
  for (var i = 0, l = allArray.length; i < l; i++) {
    if (allArray[i].value) {
      allArray[i].value = convertString(allArray[i].value);
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
            emoji = emoji.replace(':', '');
          }
          slackEmoji = emojiMap.get(emoji);
          if (slackEmoji) {
            imageString = '<img src="'+slackEmoji+'" height="'+localStorage.getItem('fontSize')+'">';
            v = v.replace(emojiStrings[i], imageString);
          }
        }
      }
    }
  }
  return v;
}

getCookie();
getFontSize();



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
  if (!Http.responseText || Http.status !== 200 || Http.readyState !== 4 ) {return}
  const text = JSON.parse(Http.responseText);
  const emoji = text.emoji;
  for (let key in emoji) {
    while (emoji[key] && emoji[key].includes('alias:')) {
      key = emoji[key].replace('alias:', '');
    }
    if (emoji[key]) {
      emojiMap.set(key, emoji[key]);
    }
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


document.addEventListener("keydown", popUp, false);
document.addEventListener("keyup", keyUp, false);
let map = new Map();
function popUp(e) {
    var code = e.keyCode || e.which;
    map[code] = true;
    if (map[91] && map[66]) {
      var fontSize = localStorage.getItem('fontSize');
      var keys = emojiMap.keys();
      var iterator1 = emojiMap.entries();
      console.log(iterator1.next().value[1]);
      var seachBox = '<div style="width: 220px; height: 160px; overflow: scroll" id="infinite-list">';
      seachBox += '</div>';
      seachBox += `<input style="width: 220px;" type="text" id="emoji"></input>`;
      document.body.innerHTML +='<dialog>' + seachBox + '</dialog>';
      var dialog = document.querySelector("dialog");
      dialog.showModal();

      var listElm = document.querySelector('#infinite-list');

      // Add 20 items.
      var nextItem = 1;
      page = 1;
      var loadMore = function() {
        for (var i = 0; i < 40; i++) {
          var item = document.createElement('im');
          item = '<img src="'+iterator1.next().value[1]+'" height="'+fontSize+'">';
          listElm.innerHTML += item;
        }
      };

      var removeUnloaded

      // Detect when scrolled to bottom.
      listElm.addEventListener('scroll', function() {
        if (listElm.scrollTop + listElm.clientHeight >= listElm.scrollHeight) {
          loadMore();
        }
      });

      // Initially load some items.
      loadMore();
    }
}

function keyUp(e) {
  var code = e.keyCode || e.which;
  map[code] = false;
}
getCookie();
getFontSize();



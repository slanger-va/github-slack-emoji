document.addEventListener("keyup", keyDownTextField, false);
let activeElemnt;
let dialogIsOpen = false;

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

function isCharacterKeyPress(evt) {
  if (typeof evt.which == "number" && evt.which > 0) {
    return !evt.ctrlKey && !evt.metaKey && !evt.altKey && evt.which != 8 && evt.which !== 13;
  }
  return false;
}

function openSearch() {
  let seachBox = '<div style="width: 220px; height: 160px; overflow: scroll" id="infinite-list"></div>';
  seachBox += '<input style="width: 220px;" type="text" id="emoji">';
  document.body.innerHTML += '<dialog>' + seachBox + '</dialog>';
  let dialog = document.querySelector("dialog");
  try {
    dialog.showModal();
    dialogIsOpen = true;
  }
  catch (e) {
    dialog.close();
    dialog = document.querySelector("dialog");
    dialog.showModal();
    dialogIsOpen = true;
  }

  var input = document.getElementById("emoji");
  input.value = '';
  input.onkeyup = function(evt) {
    let value = input.value;
    if (isCharacterKeyPress(evt)) {
      if (value === '') {
        searched('a');
      } else {
        searched(value)
      }
    }
  };
  hideOnClickOutside(dialog);
}

let fontSize = localStorage.getItem('fontSize');
function searched(e) {
  let results = fuse.search(e);
  if (results) {
    let listElm = document.querySelector('#infinite-list');
    if (listElm) {
      let items = '';
      for (let i = 0; i < results.length && i < 200; i++) {
        items += '<img id="' + keys[results[i]] + '" src="' + emojiMap.get(keys[results[i]]) + '" height="' + fontSize + '">';
      }
      listElm.innerHTML = items;
    }
  }
}

function keyDownTextField(e) {
  if(e.key === ':') {
    if (!dialogIsOpen) {
      activeElemnt = document.activeElement.id;
    }
    openSearch();
  }
}

const Http = new XMLHttpRequest();
const url='https://slack.com/api/emoji.list?token=' + localStorage.getItem('slackToken');
Http.open("GET", url);
Http.send();
const emojiMap = new Map();
let keys = [];
let fuse;
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
  keys = Array.from( emojiMap.keys() );
  var options = {
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
  };
  fuse = new Fuse(keys, options); // "list" is the item array
};

function convertString(v) {
  if (emojiMap && emojiMap != null) {
    if (v) {
      let emojiStrings = v.match(':.*:');
      if (emojiStrings) {
        for (let i = 0; i < emojiStrings.length; i++) {
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


function hideOnClickOutside(element) {
  const outsideClickListener = event => {
    if(event.target && event.srcElement && event.srcElement.childElementCount === 0) {
      if (event.target.currentSrc && event.target.id) {
        var usersTextArea = document.getElementById(activeElemnt);
        var imageString = '<img id="' + event.target.id + '" src="' + event.target.currentSrc + '" height="' + localStorage.getItem('fontSize') + '">';
        usersTextArea.innerHTML  += imageString;
        var gitHubEmojiDialog = document.getElementById(usersTextArea.getAttribute('aria-owns'));
        if (gitHubEmojiDialog){
          gitHubEmojiDialog.style.display = "none";
        }
      }
    } else {
      element.close();
      dialogIsOpen = false;
      removeClickListener()
    }
  };

  const removeClickListener = () => {
    document.removeEventListener('click', outsideClickListener)
  };

  document.addEventListener('click', outsideClickListener)
}

getCookie();
getFontSize();


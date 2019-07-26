const COLON_KEY = '58';

document.addEventListener("keyup", keyDownTextField, false);
document.addEventListener("keydown", keyDown, false);
let fontSize = localStorage.getItem('fontSize');
let useSearch = localStorage.getItem('useSearch');
let shortcut = parseInt(localStorage.getItem('shortcut') || COLON_KEY);

let seachBox = '<div style="width: 220px; height: 160px; overflow: scroll" id="infinite-list"></div>';
seachBox += '<input style="width: 220px;" type="text" id="emoji">';
document.body.innerHTML += '<dialog>' + seachBox + '</dialog>';

let activeElement;
let beforeSearchText;
let afterSearchText;
let activeElementValue;
let dialogIsOpen = false;
let hideDialog = false;
let textlengthAdded = 0;
let pressedKeys = [];

function getCookie(){
  chrome.extension.sendMessage({name: 'getLoginCookie'}, function(response) {
    if( response['slackToken']) {
      localStorage.setItem('slackToken', response['slackToken'])
    }
  })
}

function getUseSearch(){
  chrome.extension.sendMessage({name: 'getUseSearch'}, function(response) {
    if( response['useSearch']) {
      useSearch =  response['useSearch'];
      localStorage.setItem('useSearch', response['useSearch'])
    } else {
      useSearch = false;
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

function getShortcut() {
  chrome.extension.sendMessage({name: 'getShortcut'}, function(response) {
    if (response['shortcut']) {
      localStorage.setItem('shortcut', response['shortcut'])
    }
  })
}

function isCharacterKeyPress(evt) {
  if (typeof evt.which == "number" && evt.which > 0) {
    return !evt.ctrlKey && !evt.metaKey && !evt.altKey && evt.which !== 13  && evt.which !== 186;
  }
  return false;
}

function openSearch() {
  document.activeElement.value = activeElementValue;
  activeElement.value = activeElementValue;

  var usersTextArea = document.getElementById(activeElement.id);
  if (usersTextArea) {
    var gitHubEmojiDialog = document.getElementById(usersTextArea.getAttribute('aria-owns'));
    if (gitHubEmojiDialog) {
      gitHubEmojiDialog.style.display = "none";
    }
  }

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
    } else if (evt.which === 186) {
      hideDialog = true;
      if (usersTextArea) {
        addTextToTextarea(usersTextArea, ':' + value);
      }
    }

  };
  hideOnClickOutside(dialog);
}

function searched(e) {
  let results = fuse.search(e);
  if (results) {
    let listElm = document.querySelector('#infinite-list');
    if (listElm) {
      let items = '';
      for (let i = 0; i < results.length && i < 100; i++) {
        items += '<img id="' + keys[results[i]] + '" src="' + emojiMap.get(keys[results[i]]) + '" height="' + fontSize + '" title="' + keys[results[i]] + '">';
      }
      listElm.innerHTML = items;
    }
  }
}

export function shouldOpenDialog(element) {
  return false;
}

function keyDownTextField(e) {
  if((e.key.charCodeAt(0) === shortcut || pressedKeys.find(k => k.key.charCodeAt(0) === shortcut)) && useSearch !== 'false') {
    var usersTextArea;
    activeElement = document.activeElement;
    if (!dialogIsOpen && shouldOpenDialog(activeElement)) {
      setBeforeAndAfterSearch();
      if (!activeElement) { return }
      var getElemt = document.getElementById(activeElement.id);
      if (!getElemt || getElemt.id === 'issue_title') { return }
      activeElementValue = document.activeElement.value;
      activeElement.innerHTML = activeElementValue;
      openSearch();
    }
  }

  if (hideDialog) {
    closeDialog();
  } else if (e.key === shortcut) {
    beforeSearchText += shortcut;
  }

  if (useSearch === "false") {
    activeElementValue = document.activeElement.value;
    activeElement = document.activeElement;
    setBeforeAndAfterSearch()
  }

  if (activeElement && activeElement.id !== 'issue_title') {
    usersTextArea = document.getElementById(activeElement.id);
    if (usersTextArea) {
      if (usersTextArea.value.match(':.*:')) {
        let oldlength = usersTextArea.value.length;
        usersTextArea.value = convertString(usersTextArea.value);
        usersTextArea.focus();
        if (oldlength !== usersTextArea.value .length) {
          usersTextArea.selectionEnd = beforeSearchText.length + (usersTextArea.value.length - oldlength);
        }
      }
    }
  }

  if(e.key === 'Escape') {
    // TODO: Prevent closing the "Review Changes" tooltip
    closeDialog();
  }
  pressedKeys = pressedKeys.filter(k => k.key !== e.key);
}


function setBeforeAndAfterSearch() {
  if (activeElement) {
    var start = activeElement.selectionStart;
    var end = activeElement.selectionEnd;
    var text = activeElement.value;
    if (text) {
      beforeSearchText = text.substring(0, start);
      beforeSearchText = beforeSearchText.substring(0, beforeSearchText.length - 1);
      afterSearchText = text.substring(end, text.length);
    }
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
    if (emoji[key].includes('alias:')) {
      let childKey = key;
      while (emoji[key] && emoji[key].includes('alias:')) {
        key = emoji[key].replace('alias:', '');
      }
      if (emoji[key]) {
        emojiMap.set(childKey, emoji[key]);
      }
    } else {
      if (emoji[key]) {
        emojiMap.set(key, emoji[key]);
      }
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
              imageString = '<img src="'+slackEmoji+'" height="'+localStorage.getItem('fontSize')+'" title="' + newemoji + '">';
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

function addTextToTextarea(el, newText) {
  var start = activeElement.selectionStart;
  var end = activeElement.selectionEnd;
  var text = activeElement.value;
  beforeSearchText = text.substring(0, start);
  beforeSearchText = beforeSearchText.substring(0, beforeSearchText.length - 1);
  beforeSearchText = beforeSearchText + newText;
  afterSearchText = text.substring(end, text.length);
  el.value = (beforeSearchText + afterSearchText);
}

function hideOnClickOutside() {
  document.addEventListener('click', outsideClickListener)
}

function outsideClickListener(event) {
  var usersTextArea = document.getElementById(activeElement.id);
  if(event && event.target && event.srcElement && event.srcElement.childElementCount === 0) {
    if (event.target.currentSrc && event.target.id) {
      var imageString = '<img id="' + event.target.id + '" title="' + event.target.id + '" src="' + event.target.currentSrc + '" height="' + localStorage.getItem('fontSize') + '">';
      addTextToTextarea(usersTextArea, imageString);
    }
  } else {
    closeDialog()
  }
}

function removeClickListener() {
  document.removeEventListener('click', outsideClickListener)
}


function closeDialog() {
  clearKeyPressed();
  let dialog = document.querySelector("dialog");
  if (dialog) {
    dialog.close();
    dialogIsOpen = false;
    hideDialog = false;
  }
  if (activeElement) {
    let usersTextArea = document.getElementById(activeElement.id);
    if (usersTextArea) {
      document.activeElement = usersTextArea;
      usersTextArea.focus();
      if (textlengthAdded > 0) {
        document.activeElement.selectionEnd = beforeSearchText.length;
      }
    }
  }


  removeClickListener();
}

function keyDown(e) {
  pressedKeys.push(e);
}

function clearKeyPressed(e) {
  pressedKeys = [];
}


getCookie();
getFontSize();
getUseSearch();
getShortcut();


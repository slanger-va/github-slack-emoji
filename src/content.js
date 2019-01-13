let pull_request = document.getElementsByName('pull_request[body]');
let comment = document.getElementsByName('comment[body]');
let issue_comment = document.getElementsByName('issue_comment[body]');
let pull_request_review_comment = document.getElementsByName('pull_request_review_comment[body]');
let pull_request_review = document.getElementsByName('pull_request_review[body]');
let newTextFields = document.getElementsByName('emoji-text-field');
document.addEventListener("keyup", keyUpTextField, false);
document.addEventListener("keyup", keyDownTextField, false);


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
  searched('');
  try {
    dialog.showModal();
  }
  catch (e) {
    dialog.close();
    dialog = document.querySelector("dialog");
    dialog.showModal();
  }

  var input = document.getElementById("emoji");
  input.value = ' ';
  input.onkeyup = function(evt) {
    let value = input.value;
    if (isCharacterKeyPress(evt)) {
      searched(value)
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
    openSearch();
  }
}

function keyUpTextField(e) {

  // pull_request = document.getElementsByName('pull_request[body]');
  // comment = document.getElementsByName('comment[body]');
  // issue_comment = document.getElementsByName('issue_comment[body]');
  // pull_request_review_comment = document.getElementsByName('pull_request_review_comment[body]');
  // pull_request_review = document.getElementsByName('pull_request_review[body]');
  newTextFields = document.getElementsByName('emoji-text-field');

  for (let i = 0, l = newTextFields.length; i < l; i++) {
    if (newTextFields[i].style.display === "none") {
      if (newTextFields[i].parentNode) {
        let replacedText = document.getElementById(newTextFields[i].id);
        if (replacedText.innerHTML) {
          newTextFields[i].innerHTML = replacedText.innerHTML;
        }
      }
    }
  }
  // for (let i = 0, l = issue_comment.length; i < l; i++) {
  //   if (issue_comment[i].value) {
  //     issue_comment[i].value = convertString(issue_comment[i].value);
  //   }
  // }
  // for (let i = 0, l = pull_request_review_comment.length; i < l; i++) {
  //   if (pull_request_review_comment[i].value) {
  //     pull_request_review_comment[i].value = convertString(pull_request_review_comment[i].value);
  //   }
  // }
  // for (let i = 0, l = pull_request_review.length; i < l; i++) {
  //   if (pull_request_review[i].value) {
  //     pull_request_review[i].value = convertString(pull_request_review[i].value);
  //   }
  // }
  // for (let i = 0, l = comment.length; i < l; i++) {
  //   if (comment[i].value) {
  //     comment[i].value = convertString(comment[i].value);
  //   }
  // }
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

        pull_request = document.getElementsByName('pull_request[body]');
        comment = document.getElementsByName('comment[body]');
        issue_comment = document.getElementsByName('issue_comment[body]');
        pull_request_review_comment = document.getElementsByName('pull_request_review_comment[body]');
        pull_request_review = document.getElementsByName('pull_request_review[body]');
        newTextFields = document.getElementsByName('pull_request[body]');

        var imageString = '<img id="' + event.target.id + '" src="' + event.target.currentSrc + '" height="' + localStorage.getItem('fontSize') + '">';
        for (var i = 0, l = pull_request.length; i < l; i++) {
          if (pull_request[i].value &&  pull_request[i].style.display !== "none") {
            var d = document.createElement('div');
            for (let z = 0, l =  pull_request[i].attributes.length; z < l; z++) {
              d.setAttribute(pull_request[i].attributes[z].name, pull_request[i].attributes[z].value);
            }
            d.innerHTML = pull_request[i].innerHTML;
            var gitHubEmojiDialog = document.getElementById(pull_request[i].getAttribute('aria-owns'));
            if (gitHubEmojiDialog){
              gitHubEmojiDialog.style.display = "none";
            }
            d.innerHTML += imageString;
            d.contentEditable = true;
            pull_request[i].style.display = "none";
            pull_request[i].parentNode.insertBefore(d, pull_request[i]);
            d.name = 'pull_request[body]';
            newTextFields = document.getElementsByName(d.name);
          }
        }
        for (let i = 0, l = newTextFields.length; i < l; i++) {
          if (newTextFields[i].style.display !== "none") {
            if (newTextFields[i].innerHTML) {
              newTextFields[i].innerHTML += imageString;
            }
          }
        }
        for (let i = 0, l = issue_comment.length; i < l; i++) {
          if (issue_comment[i].value) {
            issue_comment[i].value += imageString;
          }
        }
        for (let i = 0, l = pull_request_review_comment.length; i < l; i++) {
          if (pull_request_review_comment[i].value) {
            pull_request_review_comment[i].value += imageString;
          }
        }
        for (let i = 0, l = pull_request_review.length; i < l; i++) {
          if (pull_request_review[i].value) {
            pull_request_review[i].value += imageString;
          }
        }
        for (let i = 0, l = comment.length; i < l; i++) {
          if (comment[i].value) {
            comment[i].value += imageString;
          }
        }
      }
    } else {
      element.close();
      removeClickListener()
    }
  };

  const removeClickListener = () => {
    document.removeEventListener('click', outsideClickListener)
  };

  document.addEventListener('click', outsideClickListener)
}

function keyUp(e) {
  let code = e.keyCode || e.which;
  map[code] = false;
}
getCookie();
getFontSize();


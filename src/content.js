let pull_request = document.getElementsByName('pull_request[body]');
let comment = document.getElementsByName('comment[body]');
let issue_comment = document.getElementsByName('issue_comment[body]');
let pull_request_review_comment = document.getElementsByName('pull_request_review_comment[body]');
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
  // for (let i = 0, l = pull_request.length; i < l; i++) {
  //   if (pull_request[i].value) {
  //     pull_request[i].value = convertString(pull_request[i].value);
  //   }
  // }
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
        let imageString = '<img id="' + event.target.id + '" src="' + event.target.currentSrc + '" height="' + localStorage.getItem('fontSize') + '">';
        for (let i = 0, l = pull_request.length; i < l; i++) {
          if (pull_request[i].value) {
            pull_request[i].value += imageString;
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

//
// document.addEventListener("keydown", popUp, false);
// document.addEventListener("keyup", keyUp, false);
// let map = new Map();
// function popUp(e) {
//     let code = e.keyCode || e.which;
//     map[code] = true;
//     if (map[91] && map[66]) {
//       let fontSize = localStorage.getItem('fontSize');
//       let seachBox = '<div style="width: 220px; height: 160px; overflow: scroll" id="infinite-list">';
//       seachBox += '</div>';
//       seachBox += `<input style="width: 220px;" type="text" id="emoji"></input>`;
//       document.body.innerHTML +='<dialog>' + seachBox + '</dialog>';
//       let dialog = document.querySelector("dialog");
//       try {
//         dialog.showModal();
//       }
//       catch (e) {
//         dialog.close();
//         let c = document.querySelector("dialog");
//         c.showModal();
//       }
//       hideOnClickOutside(dialog);
//       let listElm = document.querySelector('#infinite-list');
//       let page = 0;
//       let pageSize = 80;
//       // load next page.
//       let nextPage = function(currentPage) {
//         let items = '';
//         for (let i = currentPage * pageSize; i < pageSize * (currentPage + 1); i++) {
//           if (i < keys.length) {
//             items += '<img id="' + keys[i] + '" src="' + emojiMap.get(keys[i]) + '" height="' + fontSize + '">';
//           }
//         }
//         listElm.innerHTML = items;
//       };
//
//       // load previous page.
//       let previousPage = function(currentPage) {
//         if (currentPage > 0) {
//           let items = '';
//           for (let i = (currentPage -1) * pageSize; i < pageSize * currentPage; i++) {
//             items = items + '<img id="' + keys[i] + '" src="' + emojiMap.get(keys[i]) + '" height="' + fontSize + '">';
//           }
//           listElm.innerHTML = items;
//         }
//       };
//       scrolled = false;
//
//       // Detect when scrolled to bottom.
//       listElm.addEventListener('scroll', function(e) {
//         if (e['target'].scrollTop > 15) {
//           scrolled = true;
//         }
//         if (e['target'].scrollTop + e['target'].clientHeight === e['target'].scrollHeight) {
//           console.log('loading next');
//           nextPage(page);
//           page +=1;
//           scrolled = false;
//         } else if (e['target'].scrollTop === 0 && scrolled) {
//           console.log('loading previous');
//           previousPage(page);
//           page -=1;
//           scrolled = false;
//         }
//       });
//       nextPage(page);
//       page +=1;
//     }
// }

function keyUp(e) {
  let code = e.keyCode || e.which;
  map[code] = false;
}
getCookie();
getFontSize();


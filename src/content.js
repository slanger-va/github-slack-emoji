let textareas = document.getElementsByName('pull_request[body]');
let commentareas = document.getElementsByName('comment[body]');
let issueareas = document.getElementsByName('issue_comment[body]');
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
  for (let i = 0, l = textareas.length; i < l; i++) {
    if (textareas[i].value) {
      textareas[i].value = convertString(textareas[i].value);
    }
  }
  for (let i = 0, l = commentareas.length; i < l; i++) {
    if (commentareas[i].value) {
      commentareas[i].value = convertString(commentareas[i].value);
    }
  }
  for (let i = 0, l = issueareas.length; i < l; i++) {
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


document.addEventListener("keydown", popUp, false);
document.addEventListener("keyup", keyUp, false);
let map = new Map();
function popUp(e) {
    let code = e.keyCode || e.which;
    map[code] = true;
    if (map[91] && map[66]) {
      let fontSize = localStorage.getItem('fontSize');
      let seachBox = '<div style="width: 220px; height: 160px; overflow: scroll" id="infinite-list">';
      seachBox += '</div>';
      seachBox += `<input style="width: 220px;" type="text" id="emoji"></input>`;
      document.body.innerHTML +='<dialog>' + seachBox + '</dialog>';
      let dialog = document.querySelector("dialog");
      dialog.showModal();

      let listElm = document.querySelector('#infinite-list');
      let keys = Array.from( emojiMap.keys() );
      let page = 0;
      let pageSize = 40;
      let buffer = 3;

      // load next page.
      let nextPage = function(currentPage) {
        for (let i = currentPage * pageSize; i < pageSize * (currentPage + 1); i++) {
          let item = document.createElement('im');
          item = '<img src="'+emojiMap.get(keys[i])+'" height="'+fontSize+'">';
          listElm.innerHTML += item;
        }
      };

      // load previous page.
      let previousPage = function(currentPage) {
        if (currentPage > 0) {
          for (let i = (currentPage -1) * pageSize; i < pageSize * currentPage; i++) {
            let item = document.createElement('im');
            item = '<img src="' + emojiMap.get(keys[i]) + '" height="' + fontSize + '">';
            listElm.innerHTML += item;
          }
        }
      };

      let removePageNext = function(currentPage) {
        let loadedImgs = listElm.innerHTML.split('>');
        listElm.innerHTML = '';
        if (loadedImgs.length > pageSize) {
          for(let i = 0; i < loadedImgs.length; i++) {
            if (i > currentPage * pageSize && i < pageSize * (currentPage + 1)) {

            } else {
              loadedImgs[i] += '>';
              listElm.innerHTML += loadedImgs[i];
            }
          }
        }
      };

      let removePagePrevious = function(currentPage) {
        if (currentPage > 2) {
          let loadedImgs = listElm.innerHTML.split('>');
          if (loadedImgs.length > pageSize) {
            let stringToRemove = '';
            let stringNToRemove = 0;
            let stringToKeep = '';
            for (let i = 0; i < loadedImgs.length; i++) {
              if (i <= pageSize) {
                stringToRemove += loadedImgs[i] + '>';
                stringNToRemove = stringNToRemove + (loadedImgs[i] + '>').length;
              } else {
                if (loadedImgs[i]) {
                  stringToKeep += loadedImgs[i] + '>';
                }
              }
            }
            listElm.innerHTML = listElm.innerHTML.slice(stringNToRemove, listElm.innerHTML.length);
          }
        }
      };

      // Detect when scrolled to bottom.
      listElm.addEventListener('scroll', function() {
        //TODO fix scolling
        if (listElm.scrollTop + listElm.clientHeight >= listElm.scrollHeight / 1.9) {
          page +=1;
          // console.log('loading next');
          // console.log(page);
          nextPage(page);
          removePagePrevious(page - buffer);
        } else if (listElm.scrollTop + listElm.clientHeight <= listElm.scrollHeight / 2.1) {
          // page -=1;
          // console.log('loading previous');
          // console.log(page);
          // previousPage(page);
          // removePageNext(page + buffer);
        }
      });


      for (let i =0; i < buffer; i++)  {
        nextPage(page);
        page +=1;
      }
    }
}

function keyUp(e) {
  let code = e.keyCode || e.which;
  map[code] = false;
}
getCookie();
getFontSize();



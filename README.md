# SlackExtension

Use Custom Slack Emoji's in Github

## How to Use

Add to the extension to Chrome [Chrome Web Store](https://chrome.google.com/webstore/detail/iaigeepmkbaoeebbobooiplapajefmjd/publish-accepted?authuser=0&hl=en)

Once added to chrome click the app and login to your slack workspace.
 Next you will need to navigate to [Github](https://github.com) and type in the shortcut key (you can set the shortcut key [here](chrome-extension://iaigeepmkbaoeebbobooiplapajefmjd/options.html), default is set to `:`) in order to bring up the emoji search.
 
 Now simply type in the name of the emoji you are looking for and select it. 
 
 
 To use outside of github, click on the extension logo in chrome and search for an emoji. 
 Once you have found the emoji you are looking for, simply click on it to copy the `img` element to your clipboard. 
 

## Development

First you need a `creds.js` file to store the `clientId`, `clientSecret`, `scope`, `redirectUri`, and `fontSize` to localStorage

Next run `ng build --watch` to build the extension

After the build is complete open [Chrome Extensions](chrome://extensions/) and use the Load Unpacked button.
Next you will select the dist folder for the extension and load it.
Now in a new tab (or refresh a existing tab) navigate to a github page to test. 

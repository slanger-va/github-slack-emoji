# SlackExtension

Use Custom slack emojis in github

## About

Once added to chrome, click the app and login to slack.
Then proceed to [Github](https://github.com), and type in the string name of the emoji you want surrounded by `:`'s.
You must exact match the string, currently there is no support for searching. 

## Installation

Create a creds.js file to store the `clientId`, `clientSecret`, `scope`, `redirectUri`, and `fontSize` to localStorage

## Development

`ng build --watch` 

Open [Chrome](chrome://extensions/) and use the Load Unpacked button and select the dist folder.

Reload and the extension will be running. 

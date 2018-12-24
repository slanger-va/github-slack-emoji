var clientId = '510178099568.512316531926';
var clientSecret = '8a1710814109dee548c21f6022a480c9';
var redirectUri = 'https://'+chrome.runtime.id+'.chromiumapp.org';
var scope = 'emoji:read';
var fontSize = 28;

localStorage.setItem('fontSize', fontSize);
localStorage.setItem('clientId', clientId);
localStorage.setItem('clientSecret', clientSecret);
localStorage.setItem('redirectUri', redirectUri);
localStorage.setItem('scope', scope);


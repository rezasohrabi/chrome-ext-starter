import Browser from 'webextension-polyfill';

Browser.runtime.onInstalled.addListener(() => {
  console.log('Welcome to chrome ext starter. have a nice day!');
});

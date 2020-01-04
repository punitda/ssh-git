const ua = require('universal-analytics');
const uuid = require('uuid/v4');
const { TrackingIdStore: store } = require('./store');

const packageVersion = require('../../package.json');

let visitor;
let appName = 'app.ssh-git';
let appVersion = packageVersion.version;

function initAnalytics() {
  const userId = store.get('userId') || uuid();
  visitor = ua('UA-155290096-1', userId);
}

function trackEvent(category, action) {
  visitor
    .event(category, action, error => {
      if (error) console.error('error tracking event: ', error.message);
    })
    .send();
}

function trackScreen(screenName) {
  visitor
    .pageview(screenName, appName, appVersion, error => {
      if (error) {
        console.error('error tracking pageview: ', error.message);
      }
    })
    .send();
}

module.exports = { initAnalytics, trackEvent, trackScreen };

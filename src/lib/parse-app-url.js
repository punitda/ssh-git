// Not using node's built in url module because it doesn't handles
// parsing hashed portion of urls in to query object properly
const queryString = require('query-string');

module.exports = function parseAppURL(callbackUrl) {
  const parsedUrl = queryString.parseUrl(callbackUrl);
  const url = parsedUrl.url;

  //Making sure callback url is our app's allowed protocol
  if (url !== 'ssh-git://oauth/basic') {
    return null;
  }

  const query = parsedUrl.query;

  if (Object.keys(query).length > 0) {
    return extractValuesFromQuery(query); //Github route
  } else {
    //Bitbucket/Gitlab route
    const hashedPart = callbackUrl.substring(callbackUrl.indexOf('#'));
    const query = queryString.parse(hashedPart);
    return extractValuesFromQuery(query);
  }
};

function extractValuesFromQuery(query) {
  const code = query.code;
  const state = query.state;
  const token = query.token ? query.token : query.access_token;
  if ((code !== null || token !== null) && state !== null) {
    return { code, state, token };
  } else {
    return null;
  }
}

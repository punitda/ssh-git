const URL = require('url');

module.exports = function parseAppURL(url) {
  const parsedUrl = URL.parse(url, true);
  const hostName = parsedUrl.hostname;
  if (!hostName) {
    return null;
  }

  const query = parsedUrl.query;
  const actionName = hostName.toLowerCase();
  if (actionName === 'oauth') {
    const code = query['code'];
    const state = query['state'];
    if (code !== null && state !== null) {
      return { code, state };
    } else {
      return null;
    }
  }
};

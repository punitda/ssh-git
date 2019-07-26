const axios = require('axios');
const { providers } = require('./config');

function request(
  endpoint,
  route,
  method,
  provider,
  token,
  requestBody,
  customHeaders
) {
  const config = {};

  config.baseURL = endpoint;
  config.url = route;
  config.method = method;

  let headers = {
    Accept:
      provider === providers.GITHUB
        ? 'application/vnd.github.v3+json, application/json'
        : 'application/json',
    'Content-Type': 'application/json',
  };

  if (token) {
    if (provider === providers.GITHUB) {
      headers['Authorization'] = `token ${token}`;
    } else {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  config.headers = {
    ...headers,
    ...customHeaders,
  };

  config.data = requestBody;
  config.timeout = 20000;

  return axios.request(config);
}

module.exports = request;

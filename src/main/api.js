const { oauth_base_urls, oauth, providers } = require('../lib/config');
const request = require('../lib/http');
const { github } = oauth;

async function requestGithubAccessToken(code) {
  try {
    const baseUrl = oauth_base_urls.GITHUB;
    const response = await request(
      baseUrl,
      '/access_token',
      'POST',
      providers.GITHUB,
      null,
      {
        client_id: github.client_id,
        client_secret: github.client_secret,
        code,
      }
    );
    const { access_token } = response.data;
    return access_token;
  } catch (error) {
    console.error(
      `Error fetching access_token for user : ${error.response.data}`
    );
    return null;
  }
}

module.exports = requestGithubAccessToken;

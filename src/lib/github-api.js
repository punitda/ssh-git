const { oauth_base_urls, providers } = require('./config');
const request = require('./http');

async function requestGithubAccessToken(code, githubConfig) {
  try {
    const baseUrl = oauth_base_urls.GITHUB;
    const response = await request(
      baseUrl,
      '/access_token',
      'POST',
      providers.GITHUB,
      null,
      {
        client_id: githubConfig.client_id,
        client_secret: githubConfig.client_secret,
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

const { web_base_url } = require('./config');
const request = require('./http');

async function requestGithubAccessToken(code, client_state) {
  try {
    const response = await request(
      web_base_url,
      '/api/github-callback',
      'POST',
      null,
      null,
      {
        state: client_state,
        code,
      }
    );
    const { access_token, state } = response.data;
    return { access_token, state };
  } catch (error) {
    console.error(`Error fetching access_token : ${error.response.data}`);

    if (error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error(
        'Something went wrong when authenticating your github account'
      );
    }
  }
}

module.exports = requestGithubAccessToken;

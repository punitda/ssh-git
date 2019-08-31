import uuid from 'uuid/v4';

import {
  oauth,
  oauth_base_urls,
  api_base_urls,
  providers,
} from '../../lib/config';
import request from '../../lib/http';

const { github, bitbucket, gitlab } = oauth;

export async function requestGithubUserProfile(token) {
  try {
    const baseUrl = api_base_urls.GITHUB;
    const response = await request(
      baseUrl,
      '/user',
      'GET',
      providers.GITHUB,
      token,
      null
    );

    const { login, email, avatar_url } = response.data;
    return { login, email, avatar_url };
  } catch (error) {
    console.error(
      `Error fetching Github user profile using token:  ${token} \n ${error}`
    );
    return null;
  }
}

export async function addKeysToGithubAccount(title, key, token) {
  const baseUrl = api_base_urls.GITHUB;
  const response = await request(
    baseUrl,
    '/user/keys',
    'POST',
    providers.GITHUB,
    token,
    { title, key }
  );

  return response;
}

export async function requestBitbucketUserProfile(token) {
  try {
    const baseUrl = api_base_urls.BITBUCKET;
    const accountRequest = request(
      baseUrl,
      '/user',
      'GET',
      providers.BITBUCKET,
      token,
      null
    );

    const emailRequest = request(
      baseUrl,
      '/user/emails',
      'GET',
      providers.BITBUCKET,
      token,
      null
    );

    // We need to make 2 separate api requests for getting username and email
    // becausing fucking Bitbucket Api doesn't give both details in single api such as `account`. #FML.
    const [accountResponse, emailResponse] = await Promise.all([
      accountRequest,
      emailRequest,
    ]);
    const result = {};

    result.username = accountResponse.data.username;
    result.uuid = accountResponse.data.uuid;
    result.avatar_url = accountResponse.data.links.avatar.href;

    const [primaryAccount] = emailResponse.data.values.filter(
      email => email.is_primary === true
    );
    result.email = primaryAccount.email;

    return result;
  } catch (error) {
    console.error(
      `Error fetching Bitbucket user profile using token:  ${token} \n ${error}`
    );
    return null;
  }
}

export async function requestGitlabUserProfile(token) {
  try {
    const baseUrl = api_base_urls.GITLAB;
    const response = await request(
      baseUrl,
      '/user',
      'GET',
      providers.GITLAB,
      token,
      null
    );

    const { username, email, avatar_url } = response.data;
    return { username, email, avatar_url };
  } catch (error) {
    console.error(
      `Error fetching Gitlab user profile using token:  ${token} \n ${error}`
    );
    return null;
  }
}

export async function addKeysToGitlabAccount(title, key, token) {
  const baseUrl = api_base_urls.GITLAB;
  const response = await request(
    baseUrl,
    '/user/keys',
    'POST',
    providers.GITLAB,
    token,
    { title, key }
  );

  return response;
}

export function getOauthUrlsForBasicInfo(provider) {
  const state = uuid();
  const REDIRECT_URI = 'ssh-git://oauth/basic';
  let url;
  switch (provider) {
    case providers.GITHUB:
      url = `${oauth_base_urls.GITHUB}/authorize?client_id=${github.client_id}&scope=${github.scopes.basic}&state=${state}&redirect_uri=${REDIRECT_URI}`;
      break;
    case providers.BITBUCKET:
      url = `${oauth_base_urls.BITBUCKET}/authorize?client_id=${bitbucket.client_id}&scope=${bitbucket.scopes.basic}&response_type=token&state=${state}&redirect_uri=${REDIRECT_URI}`;
      break;
    case providers.GITLAB:
      url = `${oauth_base_urls.GITLAB}/authorize?client_id=${gitlab.client_id}&scope=${gitlab.scopes.basic}&response_type=token&state=${state}&redirect_uri=${REDIRECT_URI}`;
      break;
    default:
      throw new Error(
        'Invalid provider provided for generating oauth url for getting user info'
      );
  }
  return { url, state };
}
  }
  return { url, state };
}

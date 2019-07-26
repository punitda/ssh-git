import uuid from 'uuid/v4';

import {
  oauth,
  oauth_base_urls,
  api_base_urls,
  providers,
} from '../../lib/config';
import request from '../../lib/http';

const { github, bitbucket, gitlab } = oauth;
const REDIRECT_URI = 'ssh-git://oauth';

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

    const { login, email } = response.data;
    return { login, email };
  } catch (error) {
    console.error(
      `Error fetching Github user profile using token:  ${token} \n ${error}`
    );
    return null;
  }
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
    const { email } = emailResponse.data.values.filter(
      email => email.is_primary === true
    )[0];
    result.email = email;
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
    const { username, email } = response.data;
    return { username, email };
  } catch (error) {
    console.error(
      `Error fetching Gitlab user profile using token:  ${token} \n ${error}`
    );
    return null;
  }
}

export function getGithubOAuthUrlAndState() {
  const state = uuid();
  const url = `${oauth_base_urls.GITHUB}/authorize?client_id=${
    github.client_id
  }&scope=${github.scopes}&state=${state}`;

  return { url, state };
}

export function getBitbucketOAuthUrlAndState() {
  const state = uuid();
  const url = `${oauth_base_urls.BITBUCKET}/authorize?client_id=${
    bitbucket.client_id
  }&scope=${bitbucket.scopes}&response_type=token&state=${state}`;
  return { url, state };
}

export function getGitlabOAuthUrlAndState() {
  const state = uuid();
  const url = `${oauth_base_urls.GITLAB}/authorize?client_id=${
    gitlab.client_id
  }&scope=${
    gitlab.scopes
  }&redirect_uri=${REDIRECT_URI}&response_type=token&state=${state}`;
  return { url, state };
}

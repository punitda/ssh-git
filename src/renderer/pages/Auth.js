import React, { useContext, useEffect, useState } from 'react';

import { ClientStateContext } from '../Context';
import {
  requestGithubUserProfile,
  requestBitbucketUserProfile,
  requestGitlabUserProfile,
} from '../service/api';
import { providers } from '../../lib/config';

const Auth = () => {
  const clientStateContext = useContext(ClientStateContext);
  const {
    token = null,
    username = null,
    email = null,
    selectedProvider = null,
  } = clientStateContext.authState;
  const [loading, setLoading] = useState(false);

  async function fetchGithubUserProfile() {
    setLoading(true);
    const profile = await requestGithubUserProfile(token);
    if (profile) {
      clientStateContext.setAuthState({
        email: profile.email,
        username: profile.login,
      });
    }
    setLoading(false);
  }

  async function fetchBitbucketUserProfile() {
    setLoading(true);
    const profile = await requestBitbucketUserProfile(token);
    if (profile) {
      clientStateContext.setAuthState({
        email: profile.email,
        username: profile.username,
      });
    }
    setLoading(false);
  }

  async function fetchGitlabUserProfile() {
    setLoading(true);
    const profile = await requestGitlabUserProfile(token);
    if (profile) {
      clientStateContext.setAuthState({
        email: profile.email,
        username: profile.username,
      });
    }
    setLoading(false);
  }

  useEffect(() => {
    switch (selectedProvider) {
      case providers.GITHUB:
        fetchGithubUserProfile();
        break;
      case providers.BITBUCKET:
        fetchBitbucketUserProfile();
        break;
      case providers.GITLAB:
        fetchGitlabUserProfile();
        break;
      default:
        console.error('Provider cannot be empty');
        break;
    }
  }, []);

  if (loading) {
    return (
      <h1 className="flex flex-col items-center justify-center">Loading...</h1>
    );
  } else {
    if (username && email) {
      return (
        <div>
          <h1>User Name : {username}</h1>
          <h1>Email : {email}</h1>
        </div>
      );
    } else {
      return (
        <div>
          <h1>Profile not found.</h1>
        </div>
      );
    }
  }
};

export default Auth;

import React, { useContext, useEffect } from 'react';

import { ClientStateContext } from '../Context';

import { openExternal } from '../../lib/app-shell';
import { providers } from '../../lib/config';

import githublogo from '../../../public/assets/img/github_logo.png';
import bitbucketlogo from '../../../public/assets/img/bitbucket_logo.png';
import gitlablogo from '../../../public/assets/img/gitlab_logo.png';

import {
  getGithubOAuthUrlAndState,
  getBitbucketOAuthUrlAndState,
  getGitlabOAuthUrlAndState,
} from '../service/api';

import { history } from '../App';

function ConnectAccount() {
  const clientStateContext = useContext(ClientStateContext);

  function authErrorListener(_event, error_msg) {
    alert(error_msg);
  }

  function authEventListener(_event, authState) {
    if (clientStateContext.authState.state === authState.state) {
      clientStateContext.setAuthState({
        ...authState,
      });
      history.navigate('/oauth');
    } else {
      console.error("state value received from callback url don't match");
    }
  }

  useEffect(() => {
    window.ipcRenderer.on('start-auth', authEventListener);
    window.ipcRenderer.on('auth-error', authErrorListener);
    return () => {
      window.ipcRenderer.removeListener('start-auth', authEventListener);
      window.ipcRenderer.removeListener('auth-error', authErrorListener);
    };
  }, [clientStateContext]);

  function signInWithGithub() {
    const { url, state } = getGithubOAuthUrlAndState();
    clientStateContext.setAuthState({
      state,
      selectedProvider: `${providers.GITHUB}`,
    });
    openExternal(url);
  }

  function signInWithBitbucket() {
    const { url, state } = getBitbucketOAuthUrlAndState();
    clientStateContext.setAuthState({
      state,
      selectedProvider: `${providers.BITBUCKET}`,
    });
    openExternal(url);
  }

  function signInWithGitlab() {
    const { url, state } = getGitlabOAuthUrlAndState();
    clientStateContext.setAuthState({
      state,
      selectedProvider: `${providers.GITLAB}`,
    });
    openExternal(url);
  }

  return (
    <>
      <h1 className="text-2xl text-gray-900 font-semibold text-center mt-8">
        Please select platform to connect?
      </h1>
      <div className="flex justify-center mt-12">
        <button className="flex flex-col items-center justify-center w-40 h-40 m-4 p-2 text-center bg-gray-200 rounded-lg shadow-lg font-semibold text-gray-900 text-xl focus:outline-none focus:bg-blue-200 focus:border-2 focus:border-blue-500">
          <img src={githublogo} width="48" height="48" alt="github logo" />
          <h2 className="pt-4">Github</h2>
        </button>
        <button className="flex flex-col items-center justify-center w-40 h-40 m-4 p-2 text-center bg-gray-200 rounded-lg shadow-lg font-semibold text-gray-900 text-xl focus:outline-none focus:bg-blue-200 focus:border-2 focus:border-blue-500">
          <img src={bitbucketlogo} width="56" height="56" alt="github logo" />
          <h2 className="pt-4">Bitbucket</h2>
        </button>
        <button className="flex flex-col items-center justify-center w-40 h-40 m-4 p-2 text-center bg-gray-200 rounded-lg shadow-lg font-semibold text-gray-900 text-xl focus:outline-none focus:bg-blue-200 focus:border-2 focus:border-blue-500">
          <img src={gitlablogo} width="64" height="64" alt="github logo" />
          <h2 className="pt-4">GitLab</h2>
        </button>
      </div>
      <div className="text-right mr-16 mt-8">
        <button className="px-6 py-2 text-gray-100 text-xl font-bold rounded bg-blue-500 hover:bg-blue-400 focus:bg-blue-600">
          Next
        </button>
      </div>
    </>
  );
}
export default ConnectAccount;

import React, { useContext, useEffect } from 'react';

import Wave from '../components/Wave';
import AlphaBadge from '../../../public/assets/img/alpha_badge.svg';

import { ClientStateContext } from '../Context';

import { openExternal } from '../../lib/app-shell';
import { providers } from '../../lib/config';

import {
  getGithubOAuthUrlAndState,
  getBitbucketOAuthUrlAndState,
  getGitlabOAuthUrlAndState,
} from '../service/api';

import { history } from '../App';

function Home() {
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
    <div>
      <div className="flex flex-col items-center pb-8 bg-gradient-purple-black">
        <h1 className="mt-16 text-center font-bold text-4xl text-white uppercase underline">
          ssh-git
        </h1>
        <AlphaBadge className="fixed z-10 left-0 top-0" />
        <p className="text-left px-16 pt-4 text-xl  text-white">
          ssh-git is a tool to help you generate, add and manage ssh keys for
          using git with dev platforms like Github, Bitbucket and Gitlab, etc.
          without you having to touch commandline for it.
        </p>
        <button className="rounded-lg shadow-lg font-bold bg-teal-400 text-white active:bg-teal-600 py-2 mt-16 w-48 text-xl">
          Generate Keys
        </button>
      </div>
      <Wave />
      <div className="pt-16 flex flex-col items-center">
        <h2 className="text-xl py-8 font-semibold text-gray-700">
          Generate keys for
        </h2>
        <button
          onClick={signInWithGithub}
          className="rounded-lg shadow-lg font-semibold bg-gray-900 text-white py-2 m-2 w-40 text-xl">
          Github
        </button>
        <span className="text-gray-700 py-2">
          ----------------OR----------------
        </span>
        <button
          onClick={signInWithBitbucket}
          className="rounded-lg shadow-lg font-semibold bg-blue-500 text-white py-2 m-2 w-40 text-xl">
          Bitbucket
        </button>
        <span className="text-gray-700 py-2">
          ----------------OR----------------
        </span>
        <button
          onClick={signInWithGitlab}
          className="rounded-lg shadow-lg font-semibold bg-orange-500 text-white p-2 m-2 w-40 text-xl">
          Gitlab
        </button>
      </div>
    </div>
  );
}
export default Home;

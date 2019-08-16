import React, { useContext, useEffect, useState } from 'react';

import { ClientStateContext } from '../../Context';

import { openExternal } from '../../../lib/app-shell';
import { providers } from '../../../lib/config';

import githublogo from '../../../assets/img/github_logo.png';
import bitbucketlogo from '../../../assets/img/bitbucket_logo.png';
import gitlablogo from '../../../assets/img/gitlab_logo.png';

import { getOauthUrlsAndState } from '../../service/api';

function ConnectAccount({ onNext }) {
  const clientStateContext = useContext(ClientStateContext);
  const [selectedProvider, setSelectedProvider] = useState('');

  function authErrorListener(_event, error_msg) {
    alert(error_msg);
  }

  function authEventListener(_event, authState) {
    if (clientStateContext.authState.state === authState.state) {
      clientStateContext.setAuthState({
        ...authState,
      });
      onNext('oauth/generate');
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

  function connectToProvider() {
    const { url, state } = getOauthUrlsAndState(selectedProvider);
    clientStateContext.setAuthState({
      state,
      selectedProvider,
    });
    openExternal(url);
  }

  return (
    <>
      <h1 className="text-2xl text-gray-900 font-semibold text-center mt-8">
        Please select platform for which you are generating key
      </h1>
      <div className="flex justify-center mt-12">
        {providersList.map(provider => (
          <button
            key={provider.name}
            className={
              selectedProvider === provider.name
                ? styles.selectedProvider
                : styles.unSelectedProvider
            }
            onClick={_e => setSelectedProvider(provider.name)}>
            <img
              src={provider.icon}
              width={provider.iconWidth}
              height={provider.iconHeight}
              alt={`${provider.name} logo`}
            />
            <h2 className="pt-4">{provider.displayName}</h2>
          </button>
        ))}
      </div>
      <div className="text-right mr-16 mt-8">
        <button onClick={connectToProvider} className={styles.nextStepButton}>
          Connect
        </button>
      </div>
    </>
  );
}
export default ConnectAccount;

const styles = {
  selectedProvider: `flex flex-col items-center justify-center w-40 h-40 m-4 p-2 text-center bg-gray-200 rounded-lg shadow-lg font-semibold text-gray-900 text-xl focus:outline-none bg-blue-200 border-2 border-blue-500`,
  unSelectedProvider: `flex flex-col items-center justify-center w-40 h-40 m-4 p-2 text-center bg-gray-200 rounded-lg shadow-lg font-semibold text-gray-900 text-xl focus:outline-none focus:bg-blue-200 focus:border-2 focus:border-blue-500`,
  nextStepButton: `px-6 py-2 text-gray-100 text-xl font-bold rounded bg-blue-500 hover:bg-blue-400 focus:bg-blue-600`,
};

const providersList = [
  {
    name: providers.GITHUB,
    displayName: 'GitHub',
    icon: githublogo,
    iconWidth: '48',
    iconHeight: '48',
  },
  {
    name: providers.BITBUCKET,
    displayName: 'Bitbucket',
    icon: bitbucketlogo,
    iconWidth: '56',
    iconHeight: '56',
  },
  {
    name: providers.GITLAB,
    displayName: 'GitLab',
    icon: gitlablogo,
    iconWidth: '64',
    iconHeight: '64',
  },
];

// external libs
import React, { useContext, useEffect, useState, useReducer } from 'react';

// internal React
import { ClientStateContext } from '../../Context';
import { getOauthUrlsAndState } from '../../service/api';
import fetchReducer from '../../fetchReducer';

// internal libs
import { openExternal } from '../../../lib/app-shell';
import { providers } from '../../../lib/config';

// images
import githublogo from '../../../assets/img/github_logo.png';
import bitbucketlogo from '../../../assets/img/bitbucket_logo.png';
import gitlablogo from '../../../assets/img/gitlab_logo.png';

function ConnectAccount({ onNext }) {
  const clientStateContext = useContext(ClientStateContext);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [{ isLoading: isConnecting, isError, data }, dispatch] = useReducer(
    fetchReducer,
    {
      isLoading: false,
      isError: false,
      data: null,
    }
  );

  useEffect(() => {
    window.ipcRenderer.on('start-auth', authEventListener);
    return () => {
      window.ipcRenderer.removeListener('start-auth', authEventListener);
    };
  }, [clientStateContext]);

  // Listen to redirect uris coming in from auth providers after successful authentication
  function authEventListener(_event, authState) {
    if (clientStateContext.authState.state === authState.state) {
      clientStateContext.setAuthState({ ...authState });

      dispatch({ type: 'FETCH_SUCCESS', payload: { accountConnected: true } });

      setTimeout(() => {
        onNext('oauth/generate');
      }, 1500);
    } else {
      dispatch({ type: 'FETCH_ERROR' });
    }
  }

  // Click listener for button `Connect`.
  function connectToProvider() {
    dispatch({ type: 'FETCH_INIT' });
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
        Please select platform for which you are generating the SSH key
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
      <div className="text-right mr-16 mt-16">
        <button
          onClick={connectToProvider}
          className={
            isConnecting
              ? `primary-btn px-16 text-2xl generateKey`
              : isError
              ? `primary-btn-error`
              : data
              ? `primary-btn-success`
              : `primary-btn`
          }
          disabled={selectedProvider === '' || isConnecting}>
          {isConnecting
            ? 'Connecting...'
            : isError
            ? 'Retry'
            : data
            ? 'Success!'
            : 'Connect'}
        </button>
      </div>
    </>
  );
}
export default ConnectAccount;

const styles = {
  selectedProvider: `flex flex-col items-center justify-center w-40 h-40 m-4 p-2 text-center bg-gray-200 rounded-lg shadow-lg font-semibold text-gray-900 text-xl focus:outline-none bg-blue-200 border-2 border-blue-500`,
  unSelectedProvider: `flex flex-col items-center justify-center w-40 h-40 m-4 p-2 text-center bg-gray-200 rounded-lg shadow-lg font-semibold text-gray-900 text-xl focus:outline-none focus:bg-blue-200 focus:border-2 focus:border-blue-500`,
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

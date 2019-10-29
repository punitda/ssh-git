// external libs
import React, { useContext, useEffect, useState, useReducer } from 'react';

// internal React
import { AuthStateContext } from '../../Context';
import { getOauthUrlsForBasicInfo } from '../../service/api';
import fetchReducer from '../../reducers/fetchReducer';

// internal libs
import { openExternal } from '../../../lib/app-shell';
import { providers } from '../../../lib/config';

// images
import githublogo from '../../../assets/img/github_logo.png';
import bitbucketlogo from '../../../assets/img/bitbucket_logo.png';
import gitlablogo from '../../../assets/img/gitlab_logo.png';

function ConnectAccount({ onNext }) {
  // Using context to access Auth store
  const [authState, setAuthState] = useContext(AuthStateContext);
  const { state } = authState;

  // Store currently selected provider by user.
  const [selectedProvider, setSelectedProvider] = useState('');

  // Used to manage button state based on whether connect-account was successfull or not.
  const [{ isLoading: isConnecting, isError, data }, dispatch] = useReducer(
    fetchReducer,
    {
      isLoading: false,
      isError: false,
      data: null,
    }
  );

  useEffect(() => {
    let dispose;

    async function startListeningForRedirectUri() {
      dispose = window.ipc.answerMain('connect-account', async result => {
        if (state === result.state) {
          setAuthState(prevState => ({ ...prevState, ...result }));

          dispatch({
            type: 'FETCH_SUCCESS',
            payload: { accountConnected: true },
          });
          setTimeout(() => onNext('oauth/generate'), 1500);

          return true;
        } else {
          dispatch({ type: 'FETCH_ERROR' });
          return false;
        }
      });
    }
    startListeningForRedirectUri();

    return () => {
      if (dispose) dispose();
    };
  }, [state]);

  // Click listener for button `Connect`.
  function connectToProvider() {
    dispatch({ type: 'FETCH_INIT' });
    const { url, state } = getOauthUrlsForBasicInfo(selectedProvider);

    setAuthState(prevState => ({
      ...prevState,
      state,
      selectedProvider,
    }));
    openExternal(url);
  }

  return (
    <>
      <h1 className="text-2xl text-gray-900 text-center mt-8">
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

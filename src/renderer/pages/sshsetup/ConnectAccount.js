// external libs
import React from 'react';
import toaster, { Position } from 'toasted-notes';

import { getOauthUrlsForBasicInfo } from '../../service/api';
import fetchReducer from '../../reducers/fetchReducer';

// internal libs
import { openExternal } from '../../../lib/app-shell';
import { providers } from '../../../lib/config';

// images
import githublogo from '../../../assets/img/github_logo.png';
import bitbucketlogo from '../../../assets/img/bitbucket_logo.png';
import gitlablogo from '../../../assets/img/gitlab_logo.png';

import { trackEvent } from '../../analytics';

import { observer } from 'mobx-react-lite';
import { useStore } from '../../StoreProvider';

const ConnectAccount = observer(({ onNext, location }) => {
  // Using context to access Auth store
  const { sessionStore, keyStore } = useStore();

  // Used to manage button state based on whether connect-account was successfull or not.
  const [
    { isLoading: isConnecting, isError, data },
    dispatch,
  ] = React.useReducer(fetchReducer, {
    isLoading: false,
    isError: false,
    data: null,
  });

  React.useEffect(() => {
    sessionStore.resetKey();
    if (location.state.provider) {
      sessionStore.addProvider(location.state.provider);
    }
  }, []);

  React.useEffect(() => {
    return () => toaster.closeAll();
  }, []);

  React.useEffect(() => {
    sessionStore.addMode(keyStore.getMode(sessionStore.provider));
  }, [sessionStore.provider]);

  React.useEffect(() => {
    let dispose;

    async function startListeningForRedirectUri() {
      dispose = window.ipc.answerMain('connect-account', async result => {
        if (sessionStore.state === result.state) {
          sessionStore.addToken(result.token);
          sessionStore.addState(result.state);

          dispatch({
            type: 'FETCH_SUCCESS',
            payload: { accountConnected: true },
          });
          setTimeout(() => onNext('oauth/generate'), 1500);
          trackEvent('setup-flow', `${sessionStore.provider}-connect-success`);

          return true;
        } else {
          dispatch({ type: 'FETCH_ERROR' });
          trackEvent('setup-flow', `${sessionStore.provider}-connect-error`);
          return false;
        }
      });
    }
    startListeningForRedirectUri();

    return () => {
      if (dispose) dispose();
    };
  }, [sessionStore.state]);

  // Click listener for button `Connect`.
  function connectToProvider() {
    dispatch({ type: 'FETCH_INIT' });
    const { url, state } = getOauthUrlsForBasicInfo(sessionStore.provider);

    sessionStore.addState(state);

    openExternal(url);
    trackEvent('setup-flow', `${sessionStore.provider}-connect`);
  }

  function onCopyToClipboardClicked() {
    const { url, state } = getOauthUrlsForBasicInfo(sessionStore.provider);

    sessionStore.addState(state);
    window.clipboard.writeText(url);
    // Show toast
    toaster.notify(
      () => {
        return (
          <div className="py-2 px-4 rounded shadow-md bg-green-500 text-white font-medium text-center text-base mt-20 mr-4">
            <h1 className="font-semibold text-left">Key copied to clipboard</h1>
            <span className="mt-2">
              Paste it in your browser to connect account
            </span>
          </div>
        );
      },
      {
        duration: 2500,
        position: Position['top-right'],
      }
    );
    trackEvent('setup-flow', `${sessionStore.provider}-connect`);
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
              sessionStore.provider === provider.name
                ? styles.selectedProvider
                : styles.unSelectedProvider
            }
            onClick={_e => sessionStore.addProvider(provider.name)}>
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
              ? `primary-btn pr-12 generateKey`
              : isError
              ? `primary-btn-error`
              : data
              ? `primary-btn-success`
              : `primary-btn`
          }
          disabled={isConnecting || data}>
          {isConnecting
            ? 'Connecting'
            : isError
            ? 'Retry'
            : data
            ? 'Success!'
            : 'Connect'}
        </button>
      </div>
      <div className="absolute right-0 bottom-0 mr-16 mb-8">
        <span className="text-gray-800 text-base">
          Want to connect account logged in a specific browser?
        </span>
        <button
          className="ml-2 font-medium border-b-2 border-blue-500 hover:border-blue-700 text-blue-500 hover:text-blue-700 text-base focus:outline-none"
          onClick={onCopyToClipboardClicked}>
          Copy link
        </button>
      </div>
    </>
  );
});

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

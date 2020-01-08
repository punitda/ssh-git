// External libs
import React, { useContext, useState, useEffect, useReducer } from 'react';

// Internal React
import { AuthStateContext } from '../../Context';
import useRequestUserProfile from '../../hooks/useRequestUserProfile';
import fetchReducer from '../../reducers/fetchReducer';

// Images and Loaders
import SquareLoader from 'react-spinners/SquareLoader';

import { trackEvent } from '../../analytics';
import toaster, { Position } from 'toasted-notes';

const GenerateKey = ({ onNext }) => {
  const [authState, setAuthState] = useContext(AuthStateContext);
  const { token = null, selectedProvider = null } = authState;

  const [{ data, isLoading, isError }] = useRequestUserProfile(
    selectedProvider,
    token
  );

  const { email = '', username = '', avatar_url = '', bitbucket_uuid = '' } =
    data || {};

  // State used to store user input
  const [passphrase, setPassPhrase] = useState('');
  const [passphraseError, setPassPhraseError] = useState('');
  const [userProvidedEmail, setUserProvidedEmail] = useState('');

  // State used to store whether key already exists or not for current selectedProvider and username.
  const [keyAlreadyExists, setKeyAlreadyExists] = useState(false);
  const [isLinux, setIsLinux] = useState(false);

  // Used to keep check whether notification was shown to user or not and to avoid showing it again.
  const [linuxNotificationShown, setLinuxNotificationShown] = useState(false);

  // Use to store several states of UI for generateKey process
  const [
    {
      isLoading: isGeneratingKey,
      isError: isGenerateKeyError,
      data: generateKeySuccess,
    },
    dispatch,
  ] = useReducer(fetchReducer, {
    isLoading: false,
    isError: false,
    data: null,
  });

  // Effect to save user details like username , email and bitbucket_uuid in our auth store.
  useEffect(() => {
    setAuthState(prevState => ({
      ...prevState,
      username,
      email,
      bitbucket_uuid,
    }));
  }, [username, email, bitbucket_uuid]);

  // Effect run to check if key for "selectedProvider" and "username" exists in ssh/config folder
  useEffect(() => {
    async function checkIfKeyAlreadyExists(selectedProvider, username) {
      const keyAlreadyExists = await window.ipc.callMain(
        'check-key-already-exists',
        {
          selectedProvider,
          username,
        }
      );
      setKeyAlreadyExists(keyAlreadyExists);
    }

    if (selectedProvider && username) {
      checkIfKeyAlreadyExists(selectedProvider, username);
    }
  }, [selectedProvider, username]);

  // Get platform value from main process on mount(runs once)
  useEffect(() => {
    async function isLinuxOS() {
      const isLinux = await window.ipc.callMain('check-if-linux');
      setIsLinux(isLinux);
    }
    isLinuxOS();
  }, []);

  // Close all notifications on unmount.
  // Using unmount method of useEffect() to remove all notifications displayed.
  useEffect(() => {
    return () => {
      toaster.closeAll();
    };
  }, []);

  // Effect which shows notification as soon as user enters passphrase.
  // After passphrase is entered and user is shown notification and then we set `linuxNotificationShown` to "true" indicating
  // that notification is already shown to user and use it to not show notification again
  useEffect(() => {
    if (isLinux) {
      showPassphraseNotification();
    }
  }, [passphrase, linuxNotificationShown]);

  function showPassphraseNotification() {
    if (!linuxNotificationShown && passphrase && passphrase.length > 0) {
      setLinuxNotificationShown(true);

      toaster.notify(
        ({ onClose }) => {
          return (
            <div className="mt-24 mr-8 w-64">
              <div className="w-full h-auto py-2 px-4 rounded-lg shadow-xl bg-red-500 text-white text-sm">
                <p>
                  <span className="font-semibold">Note :</span> You need to
                  remember ssh key passphrase you enter because you will be
                  asked to enter it once across every system restarts whenever
                  you do any git operation using this SSH key.
                </p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 absolute right-0 top-0 mt-24 mr-2"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#f56565"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
                onClick={() => onClose()}>
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
          );
        },
        { duration: null, position: Position['top-right'] }
      );
    }
  }
  // Generate Key click listener
  async function onGenerateKeyClick(_event) {
    // Check if passphrase is valid before proceeding
    const isValidPassphrase = isPassphraseValid();
    if (!isValidPassphrase) return;

    // Check if we key already exists with same name as `selectedProvider-username` before proceeding
    let overrideKeys = false;
    if (keyAlreadyExists) {
      overrideKeys = await window.ipc.callMain('ask-to-override-keys', {
        selectedProvider,
        username,
      });
      if (!overrideKeys) {
        trackEvent('setup-flow', 'override-key-false');
        return;
      } else {
        trackEvent('setup-flow', 'override-key-true');
      }
    }

    // All good, please generate key now.
    const config = {
      selectedProvider,
      username,
      email: email ? email : userProvidedEmail,
      passphrase,
      overrideKeys,
    };
    generateKey(config);
    trackEvent('setup-flow', 'generate-key');
  }

  // Email change handlder - required in cases we don't receive email address for user from apis.
  // In those cases, we need to ask user to fill in email for us. This handler is used to manage filling in that state.
  function onEmailChange(e) {
    e.preventDefault();
    setUserProvidedEmail(e.target.value);
  }

  function isPassphraseValid() {
    if (!passphrase) {
      setPassPhraseError('Please set passphrase to protect ssh key');
      return false;
    }
    if (passphrase.length < 5) {
      setPassPhraseError('Ssh key passphrase must be min. length of 5');
      return false;
    }
    setPassPhraseError('');
    return true;
  }

  async function generateKey(config) {
    dispatch({ type: 'FETCH_INIT' }); // Triggers loading state
    const result = await window.ipc.callMain('generate-key', config);
    const { error, success } = result;

    if (success) {
      dispatch({ type: 'FETCH_SUCCESS', payload: { keyGenerated: true } });
      setTimeout(() => onNext('oauth/add'), 1500);
    } else if (error) {
      dispatch({ type: 'FETCH_ERROR' });
    }
  }

  return (
    <div
      className={`${
        isLoading ? 'h-144' : 'h-auto'
      } w-96 mx-auto my-16 px-2 pb-12 bg-gray-100 flex flex-col justify-center items-center rounded-lg shadow-md mx-auto`}>
      <SquareLoader
        loading={isLoading}
        size={48}
        sizeUnit={'px'}
        color={'#63b3ed'}
      />
      {isError && (
        <p className="text-center text-red-600 ">
          Something went wrong. Please try again.
        </p>
      )}
      {username || email ? (
        <>
          {avatar_url ? (
            <img
              className="h-24 w-24 object-cover rounded-full border-2 border-gray-500 shadow-lg mx-auto -mt-12 z-10 bg-transparent"
              src={avatar_url}
            />
          ) : (
            <div className="h-24 w-24 rounded-full border-2 border-gray-100 shadow-lg mx-auto -mt-24 z-10 bg-blue-500 flex flex-col">
              <p className="text-gray-100 uppercase text-2xl font-semibold text-center my-auto items-center">
                {username && username.length > 2
                  ? username.substring(0, 2)
                  : ''}
              </p>
            </div>
          )}
          <h2 className="text-2xl font-semibold text-gray-900">{username}</h2>
          <div className="text-left mt-2 m-8">
            <label className="text-gray-800 block text-left text-base mt-6 font-semibold">
              Email
            </label>
            <input
              type="text"
              className={email ? styles.emailExists : styles.emailDoesntExists}
              value={email ? email : userProvidedEmail}
              disabled={email ? true : false}
              onChange={onEmailChange}
              placeholder="Enter email"
            />
            <label className="text-gray-800 block text-left text-base mt-6 font-semibold">
              SSH Key Passphrase
            </label>
            <input
              type="password"
              className="text-gray-600 text-lg bg-gray-100 px-4 py-2 mt-2 rounded border-2 w-full"
              placeholder="Enter passphrase..."
              value={passphrase}
              onChange={e => setPassPhrase(e.target.value)}
            />
            <span
              className={
                passphraseError
                  ? 'mt-2 rounded p-1 text-red-600 text-sm'
                  : 'mt-2 rounded p-1 w-full'
              }>
              {passphraseError}
            </span>
            <p className="mt-4 py-1 px-2 text-sm text-gray-600 leading-tight bg-blue-100 rounded shadow">
              <span className="font-bold text-gray-700">{`Note: `}</span>
              The above passphrase that you will enter will be used to password
              protect the SSH keys that would be generated. Please do not use
              your{' '}
              <span className="font-bold text-gray-800">{`${selectedProvider}'s `}</span>
              password for additional security.
            </p>
          </div>
        </>
      ) : null}
      <button
        onClick={onGenerateKeyClick}
        className={
          isLoading
            ? `hidden`
            : isGeneratingKey
            ? `primary-btn pr-12 generateKey`
            : isGenerateKeyError
            ? `primary-btn-error`
            : generateKeySuccess
            ? `primary-btn-success`
            : `primary-btn`
        }
        disabled={
          isLoading ||
          isGeneratingKey ||
          passphrase === '' ||
          generateKeySuccess
        }>
        {isGeneratingKey
          ? 'Generating Keys'
          : isGenerateKeyError
          ? 'Retry'
          : generateKeySuccess
          ? 'Success!'
          : 'Generate Key'}
      </button>
    </div>
  );
};

const styles = {
  emailExists: `text-gray-600 text-lg bg-gray-200 px-4 py-2 mt-2 rounded border-2 w-full`,
  emailDoesntExists: `text-gray-600 text-lg bg-gray-100 px-4 py-2 mt-2 rounded border-2 w-full`,
};

export default GenerateKey;

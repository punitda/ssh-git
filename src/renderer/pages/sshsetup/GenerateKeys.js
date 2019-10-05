// External libs
import React, { useContext, useState, useEffect, useReducer } from 'react';

// Internal React
import { ClientStateContext } from '../../Context';
import useRequestUserProfile from '../../hooks/useRequestUserProfile';
import fetchReducer from '../../reducers/fetchReducer';

// Images and Loaders
import SquareLoader from 'react-spinners/SquareLoader';
import githublogo from '../../../assets/img/github_logo.png';

import {
  SHOW_ERROR_DIALOG_REQUEST_CHANNEL,
  CHECK_IF_KEY_ALREADY_EXISTS_REQUEST_CHANNEL,
  CHECK_IF_KEY_ALREADY_EXISTS_RESPONSE_CHANNEL,
  ASK_USER_TO_OVERRIDE_KEYS_REQUEST_CHANNEL,
  ASK_USER_TO_OVERRIDE_KEYS_RESPONSE_CHANNEL,
  GENERATE_KEY_REQUEST_CHANNEL,
  GENERATE_KEY_RESPONSE_CHANNEL,
} from '../../../lib/constants';

const GenerateKeys = ({ onNext }) => {
  const clientStateContext = useContext(ClientStateContext);
  const {
    token = null,
    selectedProvider = null,
  } = clientStateContext.authState;

  const [
    {
      data: {
        email = '',
        username = '',
        avatar_url = '',
        bitbucket_uuid = '',
      } = {},
      isLoading,
      isError,
    },
  ] = useRequestUserProfile(selectedProvider, token);

  const [passphrase, setPassPhrase] = useState('');

  const [keyAlreadyExists, setKeyAlreadyExists] = useState(false);
  const [shouldOverrideKeys, setShouldOverrideKeys] = useState(false);

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

  useEffect(() => {
    window.ipcRenderer.on(
      GENERATE_KEY_RESPONSE_CHANNEL,
      generatedKeysResultListener
    );
    return () => {
      window.ipcRenderer.removeListener(
        GENERATE_KEY_RESPONSE_CHANNEL,
        generatedKeysResultListener
      );
    };
  }, [clientStateContext]);

  useEffect(() => {
    if (selectedProvider && username) {
      window.ipcRenderer.send(CHECK_IF_KEY_ALREADY_EXISTS_REQUEST_CHANNEL, {
        selectedProvider,
        username,
      });
    }
    window.ipcRenderer.on(
      CHECK_IF_KEY_ALREADY_EXISTS_RESPONSE_CHANNEL,
      keyAlreadyExistsResultListener
    );

    return () => {
      window.ipcRenderer.removeListener(
        CHECK_IF_KEY_ALREADY_EXISTS_RESPONSE_CHANNEL,
        keyAlreadyExistsResultListener
      );
    };
  }, [selectedProvider, username]);

  useEffect(() => {
    window.ipcRenderer.on(
      ASK_USER_TO_OVERRIDE_KEYS_RESPONSE_CHANNEL,
      overrideKeysUserResponseListener
    );

    return () => {
      window.ipcRenderer.removeListener(
        ASK_USER_TO_OVERRIDE_KEYS_RESPONSE_CHANNEL,
        overrideKeysUserResponseListener
      );
    };
  }, [selectedProvider, username]);

  useEffect(() => {
    if (shouldOverrideKeys) {
      generateKeys();
    }
  }, [shouldOverrideKeys]);

  //Listen to ssh generate final result
  function generatedKeysResultListener(_event, result) {
    const { error, success } = result;
    if (success) {
      dispatch({ type: 'FETCH_SUCCESS', payload: { keyGenerated: true } });
      setTimeout(() => {
        onNext('oauth/addKeys');
      }, 1500);
    } else if (error) {
      dispatch({ type: 'FETCH_ERROR' });
      showErrorDialog(error.message ? error.message : 'Something went wrong.');
    }
  }

  function keyAlreadyExistsResultListener(_event, keyAlreadyExists) {
    setKeyAlreadyExists(keyAlreadyExists);
  }

  function overrideKeysUserResponseListener(_event, shouldOverrideKeys) {
    setShouldOverrideKeys(shouldOverrideKeys);
  }

  //Generate Key clickListener
  function generateKeys(_event) {
    if (keyAlreadyExists && !shouldOverrideKeys) {
      window.ipcRenderer.send(ASK_USER_TO_OVERRIDE_KEYS_REQUEST_CHANNEL, {
        selectedProvider,
        username,
      });
      return;
    }

    const config = {
      selectedProvider,
      username,
      email,
      passphrase,
      overrideKeys: shouldOverrideKeys,
    };

    dispatch({ type: 'FETCH_INIT' });

    clientStateContext.setAuthState({ username, email, bitbucket_uuid });
    window.ipcRenderer.send(GENERATE_KEY_REQUEST_CHANNEL, config);
  }

  function showErrorDialog(errorMessage) {
    window.ipcRenderer.send(SHOW_ERROR_DIALOG_REQUEST_CHANNEL, errorMessage);
  }

  return (
    <div className="h-128 w-96 my-20 bg-gray-100 flex flex-col justify-center items-center rounded-lg shadow-md mx-auto">
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
      {username && email ? (
        <>
          <img
            className="h-24 w-24 rounded-full border-2 border-gray-500 shadow-lg mx-auto -mt-24 z-10 bg-transparent"
            src={avatar_url ? avatar_url : githublogo}
          />
          <h2 className="text-2xl font-semibold text-gray-900">{username}</h2>
          <div className="text-left mt-2 m-8">
            <label className="text-gray-800 block text-left text-base mt-6 font-semibold">
              Email
            </label>
            <input
              type="text"
              className="text-gray-600 text-lg bg-gray-200 px-4 py-2 mt-2 rounded border-2 w-full"
              value={email}
              disabled
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
            <p className="mt-6 text-sm text-gray-600">
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
        onClick={generateKeys}
        className={
          isLoading
            ? `hidden`
            : isGeneratingKey
            ? `primary-btn px-16 text-2xl generateKey`
            : isGenerateKeyError
            ? `primary-btn-error`
            : generateKeySuccess
            ? `primary-btn-success`
            : `primary-btn`
        }
        disabled={isLoading || isGeneratingKey || passphrase === ''}>
        {isGeneratingKey
          ? 'Generating Keys...'
          : isGenerateKeyError
          ? 'Retry'
          : generateKeySuccess
          ? 'Success!'
          : 'Generate Key'}
      </button>
    </div>
  );
};

export default GenerateKeys;

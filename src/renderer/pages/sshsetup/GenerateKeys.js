// External libs
import React, { useContext, useState, useEffect, useReducer } from 'react';

// Internal React
import { ClientStateContext } from '../../Context';
import useRequestUserProfile from '../../hooks/useRequestUserProfile';
import fetchReducer from '../../reducers/fetchReducer';

// Images and Loaders
import SquareLoader from 'react-spinners/SquareLoader';
import githublogo from '../../../assets/img/github_logo.png';

import { SHOW_ERROR_DIALOG_REQUEST_CHANNEL } from '../../../lib/constants';

const GenerateKeys = ({ onNext }) => {
  const clientStateContext = useContext(ClientStateContext);
  const { token = null, selectedProvider = null } = {
    selectedProvider: 'github',
  };

  const [{ data, isLoading, isError }] = [
    {
      data: {
        email: 'punitdama@gmail.com',
        username: 'punitda',
        avatar_url: 'https://google.com',
      },
      isLoading: false,
      isError: false,
    },
  ];

  const [passphrase, setPassPhrase] = useState('');

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
    window.ipcRenderer.on('generated-keys-result', generatedKeysResultListener);
    return () => {
      window.ipcRenderer.removeListener(
        'generated-keys-result',
        generatedKeysResultListener
      );
    };
  }, [clientStateContext]);

  //Listen to ssh generate final result
  function generatedKeysResultListener(_event, result) {
    const { error, success } = result;
    if (success) {
      dispatch({ type: 'FETCH_SUCCESS', payload: { keyGenerated: true } });
      setTimeout(() => {
        onNext('oauth/addKeys');
      }, 1500);
    }

    if (error && error.name === 'DoNotOverrideKeysError') {
      onNext('/'); //Take user back to home screen because they said no to override keys.
    } else if (error) {
      dispatch({ type: 'FETCH_ERROR' });
      showErrorDialog(error.message);
    }
  }

  //Generate Key clickListener
  function generateKeys(_event) {
    const { username, email, bitbucket_uuid = null } = data;
    const config = {
      selectedProvider,
      username,
      email,
      passphrase,
    };

    dispatch({ type: 'FETCH_INIT' });

    clientStateContext.setAuthState({ username, email, bitbucket_uuid });
    window.ipcRenderer.send('start-generating-keys', config);
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
      {data ? (
        <>
          <img
            className="h-24 w-24 rounded-full border-2 border-gray-500 shadow-lg mx-auto -mt-24 z-10 bg-transparent"
            src={data.avatar_url ? data.avatar_url : githublogo}
          />
          <h2 className="text-2xl font-semibold text-gray-900">
            {data.username}
          </h2>
          <div className="text-left mt-2 m-8">
            <label className="text-gray-800 block text-left text-base mt-6 font-semibold">
              Email
            </label>
            <input
              type="text"
              className="text-gray-600 text-lg bg-gray-200 px-4 py-2 mt-2 rounded border-2 w-full"
              value={data.email}
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

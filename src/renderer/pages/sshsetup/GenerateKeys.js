import React, { useContext, useState, useEffect } from 'react';

import { ClientStateContext } from '../../Context';
import { useRequestUserProfile } from '../../hooks/useRequestUserProfile';

import SquareLoader from 'react-spinners/SquareLoader';
import githublogo from '../../../assets/img/github_logo.png';

const GenerateKeys = ({ onNext }) => {
  const clientStateContext = useContext(ClientStateContext);
  const {
    token = null,
    selectedProvider = null,
  } = clientStateContext.authState;

  const [{ data, isLoading, isError }] = useRequestUserProfile(
    selectedProvider,
    token
  );
  const [passphrase, setPassPhrase] = useState('');
  const [isGeneratingKey, setGenerateKeyLoader] = useState(false);

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
    setGenerateKeyLoader(false);
    if (success) {
      onNext('/oauth/addKeys');
    }

    if (error && error.name === 'DoNotOverrideKeysError') {
      onNext('/'); //Take user back to home screen because they said no to override keys.
    } else if (error) {
      showErrorDialog(error.message);
    }
  }

  //Generate Key clickListener
  function generateKeys(_event) {
    const { username, email } = data;
    const config = {
      selectedProvider,
      username,
      email,
      passphrase,
    };

    setGenerateKeyLoader(true);

    clientStateContext.setAuthState({ username, email });
    window.ipcRenderer.send('start-generating-keys', config);
  }

  function showErrorDialog(errorMessage) {
    window.ipcRenderer.send('show-error-dialog', errorMessage);
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
            : `primary-btn`
        }
        disabled={isLoading || isGeneratingKey || passphrase === ''}>
        {isGeneratingKey ? 'Generating Keys...' : 'Generate Keys'}
      </button>
    </div>
  );
};

export default GenerateKeys;

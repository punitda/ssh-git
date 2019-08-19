import React, { useContext, useState, useEffect } from 'react';

import { ClientStateContext } from '../../Context';
import { useRequestUserProfile } from '../../hooks/useRequestUserProfile';

import PropagateLoader from 'react-spinners/PropagateLoader';
import githublogo from '../../../assets/img/github_logo.png';

const GenerateKeys = ({ onNext }) => {
  const clientStateContext = useContext(ClientStateContext);
  const {
    token = null,
    selectedProvider = null,
  } = clientStateContext.authState;

  useEffect(() => {
    window.ipcRenderer.on('generated-keys-result', generatedKeysResultListener);
    window.ipcRenderer.on('generate-keys-step-result', stepResultsListener);
    return () => {
      window.ipcRenderer.removeListener(
        'generated-keys-result',
        generatedKeysResultListener
      );

      window.ipcRenderer.removeListener(
        'generate-keys-step-result',
        stepResultsListener
      );
    };
  }, [clientStateContext]);

  const [{ data, isLoading, isError }] = useRequestUserProfile(
    selectedProvider,
    token
  );

  const [passphrase, setPassPhrase] = useState('');

  //Listen to ssh generate final result
  function generatedKeysResultListener(_event, result) {
    const { error, success } = result;
    if (success) {
      console.log('on to next screen');
    } else {
      console.log('something went wrong when generating keys: ', error);
    }
  }

  //Listen to individual ssh steps
  function stepResultsListener(_event, result) {
    const { error, success, index } = result;
    if (success) {
      console.log(`${index + 1} step done`);
    } else {
      console.log(`Something went wrong in ${index} step: `, error.message);
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
    window.ipcRenderer.send('start-generating-keys', config);
  }

  return (
    <div className="h-128 w-96 my-20 bg-gray-100 flex flex-col justify-center items-center rounded-lg shadow-md mx-auto">
      <PropagateLoader
        loading={isLoading}
        size={16}
        sizeUnit={'px'}
        color={'#4299e1'}
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
        className={isLoading ? `hidden` : `primary-btn`}
        disabled={isLoading || passphrase === ''}>
        Generate Keys
      </button>
    </div>
  );
};

export default GenerateKeys;

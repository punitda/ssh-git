import React, { useContext, useState } from 'react';

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

  const [{ data, isLoading, isError }] = useRequestUserProfile(
    selectedProvider,
    token
  );

  const [passPhrase, setPassPhrase] = useState('');

  return (
    <div className="h-128 w-96 mt-20 bg-gray-100 flex flex-col justify-center items-center rounded-lg mx-auto ">
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
              value={passPhrase}
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
        onClick={_e => onNext('oauth/generate')}
        className={isLoading ? `hidden` : `primary-btn`}
        disabled={isLoading || passPhrase === ''}>
        Generate Keys
      </button>
    </div>
  );
};

export default GenerateKeys;

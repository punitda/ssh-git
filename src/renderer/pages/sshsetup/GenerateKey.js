// External libs
import React, { useContext, useState, useEffect, useReducer } from 'react';

// Internal React
import { AuthStateContext } from '../../Context';
import useRequestUserProfile from '../../hooks/useRequestUserProfile';
import fetchReducer from '../../reducers/fetchReducer';

// Images and Loaders
import SquareLoader from 'react-spinners/SquareLoader';
import githublogo from '../../../assets/img/github_logo.png'; // We need to replace this with default placeholder profile icon with bg-color as our primary button color

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
  const [userProvidedEmail, setUserProvidedEmail] = useState('');

  // State used to store whether key already exists or not for current selectedProvider and username.
  const [keyAlreadyExists, setKeyAlreadyExists] = useState(false);

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

  // Generate Key click listener
  async function onGenerateKeyClick(_event) {
    let overrideKeys = false;
    if (keyAlreadyExists) {
      overrideKeys = await window.ipc.callMain('ask-to-override-keys', {
        selectedProvider,
        username,
      });
      if (!overrideKeys) return;
    }

    const config = {
      selectedProvider,
      username,
      email: email ? email : userProvidedEmail,
      passphrase,
      overrideKeys,
    };
    generateKey(config);
  }

  // Email change handlder - required in cases we don't receive email address for user from apis.
  // In those cases, we need to ask user to fill in email for us. This handler is used to manage filling in that state.
  function onEmailChange(e) {
    e.preventDefault();
    setUserProvidedEmail(e.target.value);
  }

  async function generateKey(config) {
    dispatch({ type: 'FETCH_INIT' }); // Triggers loading state
    const result = await window.ipc.callMain('generate-key', config);
    const { error, success } = result;

    if (success) {
      dispatch({ type: 'FETCH_SUCCESS', payload: { keyGenerated: true } });
      setTimeout(() => onNext('oauth/addKeys'), 1500);
    } else if (error) {
      dispatch({ type: 'FETCH_ERROR' });
    }
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
      {username || email ? (
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
        onClick={onGenerateKeyClick}
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

const styles = {
  emailExists: `text-gray-600 text-lg bg-gray-200 px-4 py-2 mt-2 rounded border-2 w-full`,
  emailDoesntExists: `text-gray-600 text-lg bg-gray-100 px-4 py-2 mt-2 rounded border-2 w-full`,
};

export default GenerateKey;

import React, { useState, useEffect, useContext, useRef } from 'react';

// built-in react imports
import { ClientStateContext } from '../../Context';
import useAddKeysToAccount from '../../hooks/useAddKeysToAccount';

// Api imports
import { getOauthUrlsForSshKeys } from '../../service/api';

// libs import
import { openExternal } from '../../../lib/app-shell';
import { providers } from '../../../lib/config';
import { getManualSteps } from '../../../lib/util';
import {
  PUBLIC_KEY_COPY_REQUEST_CHANNEL,
  PUBLIC_KEY_COPY_RESPONSE_CHANNEL,
  ADD_KEYS_PERMISSION_RESULT_CHANNEL,
} from '../../../lib/constants';

function AddKeys({ onNext }) {
  const clientStateContext = useContext(ClientStateContext);
  const {
    selectedProvider = null,
    bitbucket_uuid = null,
    username = null,
  } = clientStateContext.authState;

  const textareaRef = useRef(); // need ref to textarea's node to use `copy` command on it for copying to clipboard.
  const [keyCopied, setKeyCopied] = useState(false); // use to show minor animation when key is copied
  const [publicKey, setPublicKeyContent] = useState({
    content: ' ',
    title: null,
  }); // set public key's content

  const { content: publicKeyContent, title = null } = publicKey;

  // Custom hook to manage entire state of 2 things
  // 1. asking permissions and
  // 2. adding keys
  const [state, dispatch, setUserData] = useAddKeysToAccount(selectedProvider);
  const {
    askingPermission,
    askingPermissionSuccess,
    askingPermissionError,
    addingKeys,
    addingKeysSuccess,
    addingKeysError,
  } = state;

  //Open next page after state reaches `addingKeysSucess` - when keys are added successfully
  useEffect(() => {
    if (addingKeysSuccess) {
      setTimeout(() => {
        openNextPage();
      }, 1500);
    }
  }, [addingKeysSuccess]);

  /**
   * Communication between main and renderer process for 2 reasons.
   * 1. Getting Public Key content based on current `selectedProvider`and `username`.
   * 2. Listening to `ssh-git://oauth/admin` permission results from main process
   * when redirected to app.
   */
  useEffect(() => {
    // Send request for getting public key content
    window.ipcRenderer.send(PUBLIC_KEY_COPY_REQUEST_CHANNEL, {
      selectedProvider,
      username,
    });
    // Public key content listener
    window.ipcRenderer.on(PUBLIC_KEY_COPY_RESPONSE_CHANNEL, publicKeyListener);

    // Permission result listener
    window.ipcRenderer.on(
      ADD_KEYS_PERMISSION_RESULT_CHANNEL,
      adminPermissionResultListener
    );

    //Remove listeners
    return () => {
      window.ipcRenderer.removeListener(
        PUBLIC_KEY_COPY_RESPONSE_CHANNEL,
        publicKeyListener
      );

      window.ipcRenderer.removeListener(
        ADD_KEYS_PERMISSION_RESULT_CHANNEL,
        adminPermissionResultListener
      );
    };
  }, [clientStateContext.authState]);

  // "Public Key content" result listener from main process
  function publicKeyListener(_event, { key = null, title = null }) {
    if (key && title) setPublicKeyContent({ content: key, title }); // set in local state for public key fields like `key` and `title`.
  }

  // "Admin Permission" result listener from main process
  function adminPermissionResultListener(_event, authState) {
    // Making sure state's match to avoid any security issues
    if (clientStateContext.authState.state === authState.state) {
      // Keeping updated state in global store
      clientStateContext.setAuthState({
        ...authState,
      });
      // needed to update local state in our custom hook to trigger addKeys api call
      setUserData({
        token: authState.token,
        publicKeyContent,
        title,
      });

      // Dispatching actions
      dispatch({
        type: 'PERMISSION_SUCCESS',
      });

      //Added timeout so that its visible for 0.5 secs(otherwise it gets batched)
      setTimeout(() => {
        dispatch({
          type: 'ADDING_KEYS',
        });
      }, 1000);
    } else {
      dispatch({ type: 'PERMISSION_ERROR' });
    }
  }

  //Open ssh-keys settings page of selected provider(Manual flow)
  function openSettingsPage() {
    switch (selectedProvider) {
      case providers.GITHUB:
        openExternal('https://github.com/settings/ssh/new');
        break;
      case providers.BITBUCKET:
        openExternal(
          `https://bitbucket.org/account/user/${bitbucket_uuid}/ssh-keys/`
        );
        break;
      case providers.GITLAB:
        openExternal('https://gitlab.com/profile/keys');
        break;
      default:
        break;
    }
  }

  //Open next screen on successfull adding of keys either manually or automatically.
  function openNextPage() {
    onNext('oauth/updateRemote');
  }

  // Copies the content of `textarea` to the clipboard
  function copyToClipboard() {
    let textarea = textareaRef.current;
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, 99999); //Not sure if this is the correct way.
    let copied = document.execCommand('copy');

    //Minor key copied animation logic
    if (copied) {
      setKeyCopied(true);
      setTimeout(() => {
        setKeyCopied(false);
      }, 2000);
    }
  }

  // Add listener for textarea change event which we don't allow to keep
  // React happy. Not sure if this is the correct way.
  function onPublicKeyChange(event) {
    event.preventDefault();
    //Don't allow changing public key content
  }

  // Open external oauth url asking admin permission
  // to post keys to account on user's behalf.
  function askForAdminPermission() {
    dispatch({ type: 'ASKING_PERMISSION' });
    const { url, state } = getOauthUrlsForSshKeys(selectedProvider);
    clientStateContext.setAuthState({
      state,
    });
    openExternal(url);
  }

  return (
    <div>
      <h2 className="mx-16 mt-8 text-2xl text-center text-gray-900">
        To start using the generated ssh key, you need to add it to your
        account.
      </h2>
      <div className="flex flex-row mt-8 items-center justify-start mx-16">
        <div className="flex flex-col flex-1">
          <h3 className="text-lg">Follow below steps(Manual):</h3>
          <ul className="text-gray-800 pr-12 text-left mt-2 leading-relaxed">
            {getManualSteps(selectedProvider).map((step, index) => {
              if (index === 2) {
                return (
                  <li key={index}>
                    {`${index + 1}. ${step}`}
                    <button
                      className="underline hover:text-blue-500"
                      onClick={openSettingsPage}>
                      Link
                    </button>
                  </li>
                );
              } else if (index === 4) {
                return (
                  <li key={index}>
                    {`${index + 1}. `}
                    <button
                      className="underline hover:text-blue-500"
                      onClick={openNextPage}>
                      {step}
                    </button>
                  </li>
                );
              } else {
                return <li key={index}>{`${index + 1}. ${step}`}</li>;
              }
            })}
          </ul>
        </div>
        <div className="w-1/2">
          <h3 className="text-lg">Public Key</h3>
          <div className="relative">
            <button
              className={keyCopied ? styles.keyCopied : styles.normal}
              onClick={copyToClipboard}>
              {keyCopied ? 'Key copied!' : 'Copy to clipboard!'}
            </button>
            <textarea
              ref={textareaRef}
              rows="8"
              cols="5"
              value={publicKeyContent}
              onChange={onPublicKeyChange}
              className="text-gray-600 text-base bg-gray-200 p-4 rounded-lg border-2 mt-2 w-full resize-none"
            />
          </div>
        </div>
      </div>
      {selectedProvider !== providers.BITBUCKET && (
        <div className="flex flex-col items-center justify-center mx-16">
          <h2 className="text-center text-gray-600 text-xl mt-12">
            Do you think the above manual process is boring 😒 and want to add
            keys directly? Yes, you can!
          </h2>
          <p className="text-gray-600">
            (We can add keys on your behalf but you need to grant us some
            permissions for it)
          </p>
          <button
            onClick={askForAdminPermission}
            disabled={
              publicKeyContent === ' ' || askingPermission || addingKeys
            }
            className={
              askingPermission || addingKeys
                ? `primary-btn my-4 px-16 text-2xl generateKey`
                : askingPermissionError || addingKeysError
                ? `primary-btn-error my-4`
                : askingPermissionSuccess || addingKeysSuccess
                ? `primary-btn-success my-4`
                : `primary-btn my-4`
            }>
            {askingPermission
              ? 'Asking Permissions...'
              : askingPermissionError
              ? 'Retry'
              : askingPermissionSuccess
              ? 'Permission Granted!'
              : addingKeys
              ? 'Adding Keys...'
              : addingKeysSuccess
              ? 'Keys Added!'
              : addingKeysError
              ? 'Retry'
              : 'Add Keys'}
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  keyCopied: `absolute mt-2 py-2 px-4 font-semibold right-0 top-0 bg-green-600 hover:bg-green-800 text-white rounded-bl-lg`,
  normal: `absolute mt-2 py-2 px-4 font-semibold right-0 top-0 bg-green-400 hover:bg-green-600 text-white rounded-bl-lg`,
};

export default AddKeys;

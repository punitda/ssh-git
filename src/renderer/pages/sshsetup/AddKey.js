import React, { useState, useEffect, useContext, useRef } from 'react';

// built-in react imports
import { AuthStateContext } from '../../Context';

// libs import
import { openExternal } from '../../../lib/app-shell';
import { providers } from '../../../lib/config';
import { getManualSteps } from '../../../lib/util';

function AddKey({ onNext }) {
  const [authState, setAuthState] = useContext(AuthStateContext);
  const {
    selectedProvider = null,
    bitbucket_uuid = null,
    username = null,
  } = authState;

  const textareaRef = useRef(); // need ref to textarea's node to use `copy` command on it for copying to clipboard.
  const [keyCopied, setKeyCopied] = useState(false); // use to show minor animation when key is copied
  const [publicKey, setPublicKey] = useState(' '); // set public key's content

  /**
   * Communication between main and renderer process for :
   * - Getting Public Key content based on current `selectedProvider`and `username`.
   */
  useEffect(() => {
    async function getPublicKey(selectedProvider, username) {
      const publicKey = await window.ipc.callMain('get-public-key', {
        selectedProvider,
        username,
      });
      setPublicKey(publicKey);
    }

    getPublicKey(selectedProvider, username);
  }, [selectedProvider, username]);

  //Open ssh-keys settings page of selected provider
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

  // Open next screen using url link
  function openNextPage() {
    onNext('oauth/updateRemote');
  }

  // Copies the content of `textarea` to the clipboard
  function onCopyToClipboardClicked() {
    let textarea = textareaRef.current;
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, 99999); //Not sure if this is the correct way.
    let copied = document.execCommand('copy');

    //Minor "key copied" animation logic
    if (copied) {
      setKeyCopied(true);
      setTimeout(() => {
        setKeyCopied(false);
      }, 2000);
    }
  }

  // Add listener for textarea change event which we don't allow to change to keep
  // React happy. Not sure if this is the correct way.
  function onPublicKeyChange(event) {
    event.preventDefault();
    //Don't allow changing public key content
  }

  return (
    <div>
      <h2 className="mx-16 mt-8 text-2xl text-center text-gray-900">
        To start using the generated ssh key, you need to add it to your
        account.
      </h2>
      <div className="flex flex-row mt-8 items-center justify-start mx-16">
        <div className="flex flex-col flex-1">
          <h3 className="text-lg">Follow below steps:</h3>
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
                      className="underline text-blue-500 hover:text-blue-700"
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
              onClick={onCopyToClipboardClicked}>
              {keyCopied ? 'Key copied!' : 'Copy to clipboard!'}
            </button>
            <textarea
              ref={textareaRef}
              rows="8"
              cols="5"
              value={publicKey}
              onChange={onPublicKeyChange}
              className="text-gray-600 text-base bg-gray-200 p-4 rounded-lg border-2 mt-2 w-full resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  keyCopied: `absolute mt-2 py-2 px-4 font-semibold right-0 top-0 bg-green-600 hover:bg-green-800 text-white rounded-bl-lg`,
  normal: `absolute mt-2 py-2 px-4 font-semibold right-0 top-0 bg-green-400 hover:bg-green-600 text-white rounded-bl-lg`,
};

export default AddKey;
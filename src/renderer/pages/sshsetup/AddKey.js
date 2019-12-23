import React, { useState, useEffect, useContext, useRef } from 'react';

// built-in react imports
import { AuthStateContext } from '../../Context';

// libs import
import { openExternal } from '../../../lib/app-shell';
import { providers } from '../../../lib/config';
import { getManualSteps } from '../../../lib/util';

import ConfirmationModal from '../../components/ConfirmationModal';
import Switch from '../../components/Switch';

function AddKey({ onNext }) {
  const [authState] = useContext(AuthStateContext);
  const {
    selectedProvider = null,
    bitbucket_uuid = null,
    username = null,
  } = authState;

  const textareaRef = useRef(null); // need ref to textarea's node to use `copy` command on it for copying to clipboard.
  const nextPageButtonRef = useRef(null); // need ref for confirmations dialog
  const [keyCopied, setKeyCopied] = useState(false); // use to show minor animation when key is copied
  const [publicKey, setPublicKey] = useState(' '); // set public key's content

  const [localDontRemindMe, setLocalDontRemindMe] = useState(false);
  const [globalDontRemindMe, setGlobalDontRemindMe] = useState(false);

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

  useEffect(() => {
    if (window.localStorage.getItem('no-reminder-for-add-key')) {
      setLocalDontRemindMe(true);
      setGlobalDontRemindMe(true);
    }
  }, []);

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

  function renderConfirmationDialogContent() {
    return (
      <div className="flex flex-col justify-center">
        <h1 className="text-2xl font-semibold">Confirm</h1>
        <h2 className="mt-4 text-gray-700 text-lg">
          Did you followed all steps listed down to add ssh key to your account?
        </h2>
        <div className="flex flex-row justify-start my-6">
          <Switch
            isOn={localDontRemindMe}
            handleToggle={() => {
              setLocalDontRemindMe(!localDontRemindMe);
              window.localStorage.setItem('no-reminder-for-add-key', true);
            }}
          />
          <span className="ml-2 text-gray-600">Don't ask me again</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto flex flex-col items-center justify-center">
      <h2 className="mx-16 mt-8 text-2xl text-center text-gray-900">
        Follow below steps to add generated key to your account
      </h2>
      <div className="flex flex-row items-center justify-center mx-16 my-12">
        <div className="flex flex-col flex-1">
          <h3 className="text-xl">Steps:</h3>
          <ul className="text-gray-700 text-lg pr-12 text-left mt-2 leading-relaxed">
            {getManualSteps(selectedProvider).map((step, index) => {
              if (index === 1) {
                return (
                  <li key={index}>
                    {`${index + 1}. ${step}`}
                    <button
                      className="underline hover:text-blue-700 hover:font-semibold"
                      onClick={openSettingsPage}>
                      Link
                    </button>
                  </li>
                );
              } else {
                return <li key={index}>{`${index + 1}. ${step}`}</li>;
              }
            })}
          </ul>
        </div>
        <div className="flex-1">
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

      {!globalDontRemindMe ? (
        <ConfirmationModal
          {...nextPageConfirmationModalProps}
          buttonRef={nextPageButtonRef}
          onModalClose={() => {}}
          content={renderConfirmationDialogContent()}
          yesBtn={
            <button
              className="px-6 py-2 text-base text-gray-100 bg-green-600 hover:bg-green-700 rounded font-bold focus:outline-none"
              onClick={openNextPage}>
              Yes, I did
            </button>
          }
          noBtn={
            <button className="px-6 py-2 text-base text-red-600 hover:text-white hover:bg-red-600 border-0 rounded border-transparent focus:outline-none">
              Cancel
            </button>
          }
        />
      ) : (
        <>
          <button className="primary-btn mt-8" onClick={openNextPage}>
            Clone Repo
          </button>
          <p className="text-gray-700 text-sm mt-1">
            (Make sure you have followed the above steps before cloning repo)
          </p>
        </>
      )}
    </div>
  );
}

const styles = {
  keyCopied: `absolute mt-2 py-2 px-4 font-semibold right-0 top-0 bg-green-600 hover:bg-green-800 text-white rounded-bl-lg`,
  normal: `absolute mt-2 py-2 px-4 font-semibold right-0 top-0 bg-green-400 hover:bg-green-600 text-white rounded-bl-lg`,
};

const nextPageConfirmationModalProps = {
  triggerText: 'Clone Repo',
  buttonClassName: 'primary-btn w-56 mt-8',
  role: 'dialog',
  ariaLabel: 'Confirmation dialog before moving to next step',
};

export default AddKey;

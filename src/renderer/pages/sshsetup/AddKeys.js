import React, { useState, useEffect, useContext, useRef } from 'react';

import { ClientStateContext } from '../../Context';

import { openExternal } from '../../../lib/app-shell';
import { providers } from '../../../lib/config';
import {
  PUBLIC_KEY_COPY_REQUEST_CHANNEL,
  PUBLIC_KEY_COPY_RESPONSE_CHANNEL,
} from '../../../lib/constants';

function AddKeys({ onNext }) {
  const clientStateContext = useContext(ClientStateContext);

  const {
    selectedProvider = null,
    bitbucket_uuid = null,
    username = null,
  } = clientStateContext.authState;

  const textareaRef = useRef();
  const [keyCopied, setKeyCopied] = useState(false);
  const [publicKeyContent, setPublicKeyContent] = useState(' ');

  useEffect(() => {
    window.ipcRenderer.send(PUBLIC_KEY_COPY_REQUEST_CHANNEL, {
      selectedProvider,
      username,
    });
    window.ipcRenderer.on(PUBLIC_KEY_COPY_RESPONSE_CHANNEL, publicKeyListener);

    return () => {
      window.ipcRenderer.removeListener(
        PUBLIC_KEY_COPY_RESPONSE_CHANNEL,
        publicKeyListener
      );
    };
  }, [clientStateContext.authState]);

  function publicKeyListener(_event, publicKey) {
    setPublicKeyContent(publicKey);
  }

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

  function openNextPage() {
    onNext('oauth/updateRemote');
  }

  function copyToClipboard() {
    let textarea = textareaRef.current;
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, 99999); //Not sure if this is the correct way.
    let copied = document.execCommand('copy');
    if (copied) {
      setKeyCopied(true);
      setTimeout(() => {
        setKeyCopied(false);
      }, 2000);
    }
  }

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
          <button className="primary-btn my-4">Add Keys</button>
        </div>
      )}
    </div>
  );
}

function getManualSteps(selectedProvider) {
  switch (selectedProvider) {
    case providers.GITHUB:
      return github_steps;
    case providers.BITBUCKET:
      return bitbucket_steps;
    case providers.GITLAB:
      return gitlab_steps;
    default:
      break;
  }
}

const github_steps = [
  `Copy the Public Key you see on the right side to the clipboard`,
  `Login in to your Github account`,
  `Open this `,
  `Once you're on that page, paste the key you just copied in 1st step under "Key" input and
  for "Title" input you can give it any value you prefer to identify the key in future. [E.x. Macbook Pro(Office)]`,
  `Update Remote url of the repository`,
];

const bitbucket_steps = [
  `Copy the Public Key you see on the right side to the clipboard`,
  `Login in to your Bitbucket account`,
  `Open this `,
  `Once you're on that page, click on "Add key" button and paste the key you just copied in 1st step under "Key" input
  and for "Label" input you can give it any value you prefer to identify the key in future. [E.x. Macbook Pro(Office)]`,
  `Update Remote url of the repository`,
];

const gitlab_steps = [
  `Copy the Public Key you see on the right side to the clipboard`,
  `Login in to your Gitlab account`,
  `Open this `,
  `Once you're on that page, paste the key you just copied in 1st step under "Key" input 
  and for "Title" input you can give it any value you prefer to identify the key in future. [E.x. Macbook Pro(Office)]`,
  `Update Remote url of the repository`,
];

const styles = {
  keyCopied: `absolute mt-2 py-2 px-4 font-semibold right-0 top-0 bg-green-600 hover:bg-green-800 text-white rounded-bl-lg`,
  normal: `absolute mt-2 py-2 px-4 font-semibold right-0 top-0 bg-green-400 hover:bg-green-600 text-white rounded-bl-lg`,
};
export default AddKeys;

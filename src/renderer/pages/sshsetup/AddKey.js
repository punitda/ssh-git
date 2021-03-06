import React from 'react';
import toaster, { Position } from 'toasted-notes';

// libs import
import { openExternal } from '../../../lib/app-shell';
import { providers, web_base_url } from '../../../lib/config';

// component imports
import Switch from '../../components/Switch';
import { DialogOverlay, DialogContent } from '@reach/dialog';

import checkMarkAnimationData from '../../../assets/lottie/checkmark.json';
import useLottieAnimation from '../../hooks/useLottieAnimation';
import { trackEvent } from '../../analytics';

import { observer } from 'mobx-react-lite';
import { useStore } from '../../StoreProvider';

const AddKey = observer(({ onNext }) => {
  const { sessionStore, keyStore } = useStore();

  // Used for check mark animation when key is copied
  const keyLottieRef = React.useRef(null);
  const [keyCopyAnimation] = useLottieAnimation(
    checkMarkAnimationData,
    keyLottieRef
  );

  // Used for check mark animation when link is opened
  const linkLottieRef = React.useRef(null);
  const [linkOpenAnimation] = useLottieAnimation(
    checkMarkAnimationData,
    linkLottieRef
  );

  const [publicKey, setPublicKey] = React.useState(' '); // set public key's content

  // Used to keep check of state whether key was copied and link was opened by the user and show errors accordingly
  const [keyCopied, setKeyCopied] = React.useState(false);
  const [linkOpened, setLinkOpened] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Used to keep check of state of user prefs about whether to remind again or not.
  // Global one is for referring to local storage value
  // and local state is used to show state of checkbox
  // in confirmation dialog UI
  const [localDontRemindMe, setLocalDontRemindMe] = React.useState(false);
  const [globalDontRemindMe, setGlobalDontRemindMe] = React.useState(false);

  const [showConfirmationDialog, setShowConfirmationDialog] = React.useState(
    false
  );

  // Used to get value of user pref from local storage for reminder related to all steps followed or not confirmation dialog
  React.useEffect(() => {
    if (window.localStorage.getItem('no-reminder-for-add-key') === 'true') {
      setLocalDontRemindMe(true);
      setGlobalDontRemindMe(true);
    }
  }, []);

  /**
   * Communication between main and renderer process for :
   * - Getting Public Key content based on current `selectedProvider`and `username`.
   */
  React.useEffect(() => {
    async function getPublicKey(selectedProvider, mode, username) {
      const publicKey = await window.ipc.callMain('get-public-key', {
        selectedProvider,
        mode,
        username,
      });

      setPublicKey(publicKey);
    }

    getPublicKey(
      sessionStore.provider,
      sessionStore.mode,
      sessionStore.username
    );
  }, [sessionStore.provider, sessionStore.mode, sessionStore.username]);

  // Close all notifications on unmount.
  // Using unmount method of useEffect() to remove all notifications displayed.
  React.useEffect(() => {
    return () => {
      toaster.closeAll();
    };
  }, []);

  const openConfirmationDialog = () => setShowConfirmationDialog(true);
  const closeConfirmationDialog = () => setShowConfirmationDialog(false);

  //Open ssh-keys settings page of selected provider
  function openSettingsPage() {
    switch (sessionStore.provider) {
      case providers.GITHUB:
        openExternal('https://github.com/settings/ssh/new');
        break;
      case providers.BITBUCKET:
        openExternal(
          `https://bitbucket.org/account/user/${sessionStore.bitbucket_uuid}/ssh-keys/`
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
    keyStore.addKey(sessionStore);
    onNext('oauth/clone');
  }

  // Click listeners

  // Triggered when "Done" button is clicked
  function onDoneClicked(event) {
    event.preventDefault();
    if (!keyCopied) {
      setError('Please copy the ssh key');
      return;
    }
    if (!linkOpened) {
      setError('Please open settings link');
      return;
    }

    if (keyCopied && linkOpened) {
      setError(null);
      if (!globalDontRemindMe) {
        openConfirmationDialog();
        return;
      }

      openNextPage();
      trackEvent('setup-flow', 'key-added');
    }
  }

  // Triggered When "Copy" link is clicked.
  // Copies the content to the clipboard using Electron's clipboard api
  function onCopyToClipboardClicked(event) {
    event.preventDefault();
    window.clipboard.writeText(publicKey);
    setKeyCopied(true); //Set "keyCopied" state to true indicating that copy key task is done by user

    // Show toast
    toaster.notify(
      () => {
        return (
          <div className="py-2 px-4 rounded shadow-md bg-green-500 text-white font-semibold text-center text-lg mb-8 mr-4">
            Key copied to clipboard
          </div>
        );
      },
      { duration: 1500, position: Position['bottom-right'] }
    );

    // Show checkmark animation after some delay
    setTimeout(() => {
      if (keyCopyAnimation !== null) {
        keyCopyAnimation.play();
      }
    }, 500);

    trackEvent('setup-flow', 'key-copied');
  }

  function onLinkOpened(event) {
    event.preventDefault();

    setLinkOpened(true); // Set "linkOpened" state to true indicating that link has been opened by user once.
    openSettingsPage(); // open settings page

    // Show check mark animation
    if (linkOpenAnimation !== null) {
      linkOpenAnimation.play();
    }

    trackEvent('setup-flow', 'link-opened');
  }

  return (
    <div>
      <div className="flex flex-col items-center justify-center">
        <div className="mt-4 w-96 h-128 bg-gray-100 rounded-lg shadow-md flex flex-col justify-center">
          <h2 className="mx-16 mt-6 text-xl font-semibold text-center text-gray-700">
            Follow below steps to add SSH key to your account
          </h2>

          <div className="relative bg-gray-200 rounded border-gray-300 border-2 p-2 m-2 mx-4 mt-8 text-base">
            <span className="font-semibold text-xl text-gray-800 pl-2">
              1.{' '}
            </span>
            <button
              className="font-semibold border-b-4 border-blue-500 hover:border-blue-700 text-blue-500 hover:text-blue-700 text-xl focus:outline-none"
              onClick={onCopyToClipboardClicked}>
              Copy
            </button>
            <span className="text-gray-700 text-xl"> the key</span>
            <div
              className="absolute right-0 top-0 bottom-0 w-6 h-1/2 mr-2 inline"
              ref={keyLottieRef}
            />
          </div>

          <div className="relative bg-gray-200 rounded border-gray-300 border-2 p-2 m-2 mx-4 text-base">
            <span className="font-semibold text-xl text-gray-800 pl-2">
              2.{' '}
            </span>
            <button
              className="font-semibold -m-px border-b-4 border-blue-500 hover:border-blue-700 text-blue-500 hover:text-blue-700 text-xl focus:outline-none"
              onClick={onLinkOpened}>
              Open
            </button>
            <span className="text-gray-700 text-xl"> the link</span>
            <div
              className="absolute right-0 top-0 bottom-0 w-6 h-1/2 mr-2 inline"
              ref={linkLottieRef}
            />
          </div>

          <div className="bg-gray-200 rounded border-gray-300 border-2 p-2 m-2 mx-4 text-base">
            <span className="font-semibold text-xl text-gray-800 pl-2">
              3.{' '}
            </span>
            <button className="font-semibold -m-px text-blue-500 cursor-default text-xl focus:outline-none">
              Paste
            </button>
            <span className="text-gray-700 text-xl">
              {' '}
              the copied key and add to your account
            </span>
          </div>

          <span
            className={
              error
                ? 'mt-2 rounded p-1 text-center text-red-600 text-sm inline-block'
                : 'mt-2 rounded p-1 text-center w-full inline-block'
            }>
            {error ? error : ''}
          </span>

          <button className="primary-btn mt-6 mx-auto" onClick={onDoneClicked}>
            Done
          </button>

          {!globalDontRemindMe && showConfirmationDialog ? (
            <DialogOverlay
              onDismiss={closeConfirmationDialog}
              className="c-modal-cover">
              <DialogContent aria-labelledby="confirmation">
                <div className="c-modal">
                  <button
                    className="c-modal__close focus:outline-none"
                    aria-labelledby="close-modal"
                    onClick={closeConfirmationDialog}>
                    <span className="u-hide-visually" id="close-modal">
                      Close
                    </span>
                    <svg className="c-modal__close-icon" viewBox="0 0 40 40">
                      <path d="M 10,10 L 30,30 M 30,10 L 10,30"></path>
                    </svg>
                  </button>
                  <div className="flex flex-col justify-center">
                    <h1
                      className="mt-4 text-2xl font-semibold"
                      id="confirmation">
                      Confirm
                    </h1>
                    <h2 className="mt-4 text-gray-700 text-lg">
                      Did you followed all steps listed down to add ssh key to
                      your account?
                    </h2>
                    <div className="flex flex-row justify-start my-6">
                      <Switch
                        isOn={localDontRemindMe}
                        handleToggle={() => {
                          setLocalDontRemindMe(!localDontRemindMe);
                          window.localStorage.setItem(
                            'no-reminder-for-add-key',
                            !localDontRemindMe
                          );
                        }}
                      />
                      <span className="ml-2 text-gray-600">
                        Don't ask me again
                      </span>
                    </div>
                    <div className="flex flex-row justify-end">
                      <button
                        className="px-6 py-2 text-base text-gray-100 bg-green-600 hover:bg-green-700 rounded font-bold focus:outline-none"
                        onClick={openNextPage}>
                        Yes, I did
                      </button>

                      <div onClick={closeConfirmationDialog} className="ml-4">
                        <button className="px-6 py-2 text-base text-red-600 hover:text-white hover:bg-red-600 border-0 rounded border-transparent focus:outline-none">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </DialogOverlay>
          ) : null}

          <div
            className="mt-8 mb-4 text-center underline text-gray-600 hover:text-gray-700 text-sm cursor-pointer"
            onClick={() =>
              openExternal(
                `${web_base_url}/questions/why-app-doesnt-add-keys-automatically`
              )
            }>
            Why app doesn't adds key automatically?
          </div>
        </div>
      </div>
    </div>
  );
});

export default AddKey;

import React from 'react';

import Modal from '../../components/Modal';
import Switch from '../../components/Switch';

import { openFolder, openExternal } from '../../../lib/app-shell';
import { web_base_url } from '../../../lib/config';

import fetchReducer from '../../reducers/fetchReducer';

// Lottie files and hook
import bigLoaderAnimData from '../../../assets/lottie/blue_big_checkmark.json';
import setupSuccessAnimData from '../../../assets/lottie/success.json';
import useLottieAnimation from '../../hooks/useLottieAnimation';

// Confetti
import Confetti from 'react-confetti';
import useWindowSize from '../../hooks/useWindowSize';

// Reveal animation
import { Reveal, RevealGlobalStyles } from 'react-genie';
import toaster, { Position } from 'toasted-notes';

import { trackEvent } from '../../analytics';

import { useStore } from '../../StoreProvider';
import { observer } from 'mobx-react-lite';

const CloneRepo = observer(() => {
  const { sessionStore } = useStore();

  const cloneRepoButtonRef = React.useRef(null); //Used in clone repo modal for focusing reason
  const updateRemoteUrlButtonRef = React.useRef(null); // Used in update remote modal for focusing reason

  const [repoUrl, setRepoUrl] = React.useState(''); // Stores repourl entered by user
  const [selectedFolder, setSelectedFolder] = React.useState(''); // Stores parent folder that user selects where to "clone repo"
  const [repoFolder, setRepoFolder] = React.useState(''); // Stores repoFolder user selects for which they are updating "remote url"

  const [shallowClone, setShallowClone] = React.useState(false); // Stores state whether to shallow clone based on user input

  const [{ isLoading, isError, data: success }, dispatch] = React.useReducer(
    fetchReducer,
    {
      isLoading: false,
      isError: false,
      data: null,
    }
  );

  // Animation stuff

  // For big loader shown on page load
  const [bigAnimShown, setBigAnimShown] = React.useState(false);
  const bigAnimRef = React.useRef(null);
  const bigAnimation = useLottieAnimation(bigLoaderAnimData, bigAnimRef);

  // For success animtation shown next to All Setup text.
  const setupSuccessAnimRef = React.useRef(null);
  const setupSuccessAnimation = useLottieAnimation(
    setupSuccessAnimData,
    setupSuccessAnimRef
  );

  // Used by React Confetti
  const { width, height } = useWindowSize();
  const [recycleConfetti, setRecycleConfetti] = React.useState(true);

  React.useEffect(() => {
    // Making sure that we ask for desktop folder path only
    // when `selectedFolder` is empty('') which would happen
    // in case "clone repo" dialog is closed and re-opened again and during 1st time when selectedFolder isn't set yet.
    async function getSystemDesktopFolderPath() {
      const desktopFolderPath = await window.ipc.callMain(
        'get-system-desktop-path'
      );
      setSelectedFolder(desktopFolderPath);
    }
    if (!selectedFolder) {
      getSystemDesktopFolderPath();
    }
  }, [selectedFolder]);

  // Close all notifications on unmount.
  // Using unmount method of useEffect() to remove all notifications displayed.
  React.useEffect(() => {
    return () => {
      toaster.closeAll();
    };
  }, []);

  // Click listener for "Select Folder" action
  async function onChangeDefaultFolderClicked() {
    const selectedFolder = await window.ipc.callMain('select-git-folder');
    if (selectedFolder) {
      setSelectedFolder(selectedFolder);
      setRepoFolder(selectedFolder);
    }
  }

  // Click listener for "Clone Repo" button
  async function onCloneRepoClicked() {
    dispatch({ type: 'FETCH_INIT' });

    const result = await window.ipc.callMain('clone-repo', {
      selectedProvider: sessionStore.provider,
      username: sessionStore.username,
      mode: sessionStore.mode,
      repoUrl,
      selectedFolder,
      shallowClone,
    });
    const { success, repoFolder } = result;

    if (success) {
      dispatch({ type: 'FETCH_SUCCESS', payload: { success: true } });
      setTimeout(() => openFolder(repoFolder), 1000);
      trackEvent('setup-flow', 'clone-repo-success');
    } else {
      dispatch({ type: 'FETCH_ERROR' });
      trackEvent('setup-flow', 'clone-repo-error');
    }
  }

  // Click listener for "Update Remote Url" button
  async function onUpdateRemoteUrlClicked() {
    dispatch({ type: 'FETCH_INIT' });

    const result = await window.ipc.callMain('update-remote-url', {
      selectedProvider: sessionStore.provider,
      username: sessionStore.username,
      repoFolder,
    });

    const { success } = result;

    if (success) {
      dispatch({ type: 'FETCH_SUCCESS', payload: { success: true } });
      trackEvent('setup-flow', 'update-remote-success');
    } else {
      dispatch({ type: 'FETCH_ERROR' });
      trackEvent('setup-flow', 'update-remote-error');
    }
  }

  // Listen to onOpen event of Modal component for tracking event
  function onCloneRepoModalOpen() {
    trackEvent('setup-flow', 'clone-repo-dialog-opened');
  }

  // Listen to onClose event of Modal component to reset local state for "Clone Repo" Modal.
  function onCloneRepoModalClose() {
    setRepoUrl('');
    setSelectedFolder('');
    setRepoFolder('');
    setShallowClone(false);
    dispatch({ type: 'FETCH_RESET' });
    trackEvent('setup-flow', 'clone-repo-dialog-closed');
  }

  // Listen to onOpen event of Modal component for tracking event
  function onUpdateRemoteUrlModalOpen() {
    trackEvent('setup-flow', 'update-remote-dialog-opened');
  }

  // Listen to onClose event of Modal component to reset local state for "Update Remote Url" Modal.
  function onUpdateRemoteUrlModalClose() {
    setRepoFolder('');
    setSelectedFolder('');
    dispatch({ type: 'FETCH_RESET' });
    trackEvent('setup-flow', 'update-remote-dialog-closed');
  }

  function playBigAnimation() {
    if (bigAnimation !== null) {
      bigAnimation.play();
      bigAnimation.addEventListener('complete', () => {
        setBigAnimShown(true);
      });
    }
  }

  function playSetupSuccessAnimation() {
    if (setupSuccessAnimation !== null) {
      setupSuccessAnimation.play();
      setTimeout(() => {
        setRecycleConfetti(false);
        if (sessionStore.mode === 'MULTI') {
          showNotification();
        }
      }, 1500);
    }
  }

  function showNotification() {
    setTimeout(() => {
      toaster.notify(
        ({ onClose }) => {
          return (
            <div className="mt-24 mr-8 w-64">
              <div className="w-full h-auto py-2 px-4 rounded-l-lg rounded-tr-none rounded-br-lg shadow-xl bg-gray-700 text-white text-sm">
                <p className="font-semibold text-lg">Important!</p>
                <p>
                  To start using the SSH key for doing Git operations(push,
                  pull, fetch, etc.) using your existing tool of choice, you
                  have to do either of the following two things else keys setup
                  just now wouldn't work with your tool in that case :(
                </p>
                <ul className="my-4 text-left">
                  <li>
                    <div className="font-bold text-base">
                      1. Update Remote Url
                    </div>
                    Use this if the repo is already cloned on your machine.
                  </li>
                  <li className="mt-2">
                    <div className="font-bold text-base">2. Clone Repo </div>
                    Use this if the repo doesn't exists on your machine yet and
                    we will take care of rest. :)
                  </li>
                </ul>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 absolute right-0 top-0 mt-24 mr-2"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#4a5568"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                onClick={() => onClose()}>
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
          );
        },
        { duration: null, position: Position['top-right'] }
      );
    }, 2500);
  }

  // Render functions

  function renderCloneRepoDialog() {
    return (
      <div>
        <h1 className="text-2xl font-semibold">Clone Repo</h1>
        <label className="text-gray-800 block text-left text-base mt-6 font-semibold">
          Repo url
        </label>
        <input
          type="text"
          className="text-gray-800 text-base bg-gray-100 px-4 py-2 mt-2 rounded border-2 w-full"
          placeholder="Enter your repository url."
          value={repoUrl}
          onChange={e => setRepoUrl(e.target.value)}
        />
        <p className="text-gray-600 text-sm mt-2">
          [Example : git@github.com:nodejs/node.git]
        </p>
        <label className="text-gray-800 block text-left text-base mt-4 font-semibold">
          Choose Folder
        </label>
        <div className="relative mt-2">
          <input
            type="text"
            className="text-gray-800 text-base bg-gray-100 px-4 py-2 rounded border-2 w-full focus:outline-none"
            value={selectedFolder}
            readOnly
          />
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 hover:text-gray-800 px-4 text-center absolute right-0 top-0 bottom-0 rounded-r focus:outline-none"
            onClick={onChangeDefaultFolderClicked}>
            Choose
          </button>
        </div>
        <div className="my-6 flex items-center">
          <Switch
            className="flex-1"
            isOn={shallowClone}
            handleToggle={() => setShallowClone(!shallowClone)}
          />
          <span className="flex-1 ml-2 text-gray-600">Shallow Clone</span>
          <span
            className="flex-0 text-gray-600 hover:text-gray-700 text-sm underline cursor-pointer"
            onClick={() =>
              openExternal(`${web_base_url}/questions/what-is-shallow-clone`)
            }>
            What is shallow clone?
          </span>
        </div>
        <button
          className={
            isLoading
              ? `primary-btn pr-12 generateKey`
              : isError
              ? `primary-btn-error`
              : success
              ? `primary-btn-success w-full`
              : `primary-btn`
          }
          disabled={!(repoUrl && selectedFolder) || isLoading}
          onClick={onCloneRepoClicked}>
          {isLoading
            ? 'Cloning Repo'
            : isError
            ? 'Retry'
            : success
            ? 'Cloned Successfully!'
            : 'Clone'}
        </button>
        {isLoading && (
          <p className="text-xs text-gray-600 mt-2">
            This might take few seconds to minutes...You will be notified once
            the repo is cloned.
          </p>
        )}
      </div>
    );
  }

  function renderUpdateRemoteUrlDialog() {
    return (
      <div>
        <h1 className="text-2xl font-semibold">Update Remote Url</h1>
        <label className="text-gray-800 block text-left text-base mt-4 font-semibold">
          Select Repo Folder
        </label>
        <div className="relative mb-6 mt-2">
          <input
            type="text"
            className="text-gray-800 text-base bg-gray-100 px-4 py-2 rounded border-2 w-full focus:outline-none"
            value={repoFolder}
            placeholder="Select Repo Folder"
            readOnly
            onClick={onChangeDefaultFolderClicked}
          />
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 hover:text-gray-800 px-4 text-center absolute right-0 top-0 bottom-0 rounded-r focus:outline-none "
            onClick={onChangeDefaultFolderClicked}>
            Select
          </button>
        </div>
        <button
          className={
            isLoading
              ? `primary-btn pr-12 generateKey`
              : isError
              ? `primary-btn-error`
              : success
              ? `primary-btn-success w-full`
              : `primary-btn`
          }
          disabled={!repoFolder || isLoading}
          onClick={onUpdateRemoteUrlClicked}>
          {isLoading
            ? 'Upating Remote Url'
            : isError
            ? 'Retry'
            : success
            ? 'Remote Url Updated!'
            : 'Update Remote Url'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-300">
      <RevealGlobalStyles />
      {!bigAnimShown && (
        <div className="flex flex-col items-center mt-40">
          <div className="w-48 h-48" ref={bigAnimRef}>
            {playBigAnimation()}
          </div>
        </div>
      )}
      <div
        className={
          bigAnimShown
            ? 'block text-center w-96 h-auto px-8 pb-16 mx-auto bg-gray-100 rounded shadow-lg'
            : 'hidden'
        }>
        <div className="mt-12 ml-12 flex justify-center items-center">
          <Reveal onShowDone={() => playSetupSuccessAnimation()}>
            <h2 className="text-3xl text-gray-900">All Setup</h2>
          </Reveal>
          <div className="w-24 h-24 -ml-6" ref={setupSuccessAnimRef} />
        </div>

        {sessionStore.mode === 'MULTI' ? (
          <p className="text-center text-sm text-gray-700">
            Clone your repo or Update remote url of an existing repo to start
            using the SSH key.
          </p>
        ) : (
          <p className="text-center text-sm text-gray-700">
            You can now clone your repo using the SSH key.
          </p>
        )}

        <div className="text-center mt-8">
          <Modal
            {...cloneRepoModalProps}
            buttonRef={cloneRepoButtonRef}
            onModalClose={onCloneRepoModalClose}
            onModalOpen={onCloneRepoModalOpen}>
            {renderCloneRepoDialog()}
          </Modal>

          {sessionStore.mode === 'MULTI' ? (
            <>
              <p className="text-gray-700 text-xs mt-2">
                (Use this if your cloning this repository first time on your
                system)
              </p>
              <p className="my-4 text-xl">OR</p>
              <Modal
                {...updateRepoModalProps}
                buttonRef={updateRemoteUrlButtonRef}
                onModalClose={onUpdateRemoteUrlModalClose}
                onModalOpen={onUpdateRemoteUrlModalOpen}>
                {renderUpdateRemoteUrlDialog()}
              </Modal>
              <p className="text-gray-700 text-xs mt-2">
                (Use this if your already have repository on your system)
              </p>
            </>
          ) : null}
        </div>
        <Confetti width={width} height={height} recycle={recycleConfetti} />
      </div>
    </div>
  );
});

export default CloneRepo;

const cloneRepoModalProps = {
  triggerText: 'Clone Repo',
  buttonClassName: 'primary-btn w-56',
  role: 'dialog',
  ariaLabel: 'Dialog to ask for details for cloning a repo',
};

const updateRepoModalProps = {
  triggerText: 'Update Remote',
  buttonClassName: 'secondary-btn w-56',
  role: 'dialog',
  ariaLabel: 'Dialog to ask for details for updating remote url',
};

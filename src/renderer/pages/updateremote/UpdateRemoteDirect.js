import React, { useRef, useState, useEffect, useReducer } from 'react';

import { history } from '../../App';

// Components
import Modal from '../../components/Modal';
import Toolbar from '../../components/Toolbar';

// Reducer
import fetchReducer from '../../reducers/fetchReducer';

// Custom Hooks
import useDropdown from '../../hooks/useDropdown';

// Internal libs
import { openFolder } from '../../../lib/app-shell';

export default function UpdateRemoteDirect() {
  const cloneRepoButtonRef = useRef(null); //Used in modal for focusing reason
  const updateRemoteUrlButtonRef = useRef(null); // Used in modal for focusing reason

  const [repoUrl, setRepoUrl] = useState(''); // Stores repourl entered by user
  const [selectedFolder, setSelectedFolder] = useState(''); // Stores selected folder where to clone the repo
  const [repoFolder, setRepoFolder] = useState(''); // Stores repoFolder user selects for which they are updating "remote url"
  const [sshConfig, setSshConfig] = useState({}); // Stores config values coming from .ssh config file.

  // Custom hook to handle account options to select and render
  const [account, setAccount, AccountDropdown] = useDropdown(
    'Select account',
    '',
    sshConfig ? Object.keys(sshConfig) : []
  );

  // Custom hook to handle username options to select and render
  const [username, setUsername, UserNameDropDown] = useDropdown(
    'Select username',
    '',
    account ? Object.values(sshConfig[`${account}`]) : []
  );

  // Used to store state like "loading, error and success" when cloning repo or updating remote url
  const [{ isLoading, isError, data: success }, dispatch] = useReducer(
    fetchReducer,
    {
      isLoading: false,
      isError: false,
      data: null,
    }
  );

  useEffect(() => {
    async function getSshConfig() {
      const result = await window.ipc.callMain('get-ssh-config');
      const { success = false, sshConfig = null } = result;
      if (success) {
        setSshConfig(sshConfig);
      }
    }

    getSshConfig();
  }, []);

  useEffect(() => {
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

  function goBackToHomeScreen() {
    history.navigate('');
  }

  // Click listener for "select folder" action
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
      selectedProvider: account,
      username,
      repoUrl,
      selectedFolder,
    });
    const { success, error, repoFolder } = result;

    if (success) {
      dispatch({ type: 'FETCH_SUCCESS', payload: { success: true } });
      setTimeout(() => openFolder(repoFolder), 1000);
    } else {
      dispatch({ type: 'FETCH_ERROR' });
    }
  }

  // Click listener for "Update Remote Url" button
  async function onUpdateRemoteUrlClicked() {
    dispatch({ type: 'FETCH_INIT' });

    const result = await window.ipc.callMain('update-remote-url', {
      selectedProvider: account,
      username,
      repoFolder,
    });
    const { success, error } = result;

    if (success) {
      dispatch({ type: 'FETCH_SUCCESS', payload: { success: true } });
    } else {
      dispatch({ type: 'FETCH_ERROR' });
    }
  }

  // Listen to onClose events of Modal component to reset local state.
  function onCloneRepoModalClose() {
    setRepoUrl('');
    setSelectedFolder('');
    setRepoFolder('');
    setAccount('');
    setUsername('');
    dispatch({ type: 'FETCH_RESET' });
  }

  // Listen to onClose event of Update Remote Url Modal component
  // to reset local state once the modal is closed
  function onUpdateRemoteUrlModalClose() {
    setRepoFolder('');
    setSelectedFolder('');
    setAccount('');
    setUsername('');
    dispatch({ type: 'FETCH_RESET' });
  }

  function renderCloneRepoDialog() {
    return (
      <div>
        <h1 className="text-2xl font-semibold">Clone Repo</h1>
        <AccountDropdown />
        <UserNameDropDown />
        <label className="text-gray-800 block text-left text-base mt-6 font-semibold">
          Repo url
        </label>
        <input
          type="text"
          className="text-gray-800 text-base bg-gray-100 px-4 py-2 mt-2 rounded border-2 w-full"
          placeholder="Enter your repository's SSH url."
          value={repoUrl}
          onChange={e => setRepoUrl(e.target.value)}
        />
        <label className="text-gray-800 block text-left text-base mt-4 font-semibold">
          Choose Folder
        </label>
        <div className="relative mb-6 mt-2">
          <input
            type="text"
            className="text-gray-800 text-base bg-gray-100 px-4 py-2 rounded border-2 w-full focus:outline-none"
            value={selectedFolder}
            onClick={onChangeDefaultFolderClicked}
            readOnly
          />
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 hover:text-gray-800 px-4 text-center absolute right-0 top-0 bottom-0 rounded-r focus:outline-none"
            onClick={onChangeDefaultFolderClicked}>
            Choose
          </button>
        </div>
        <button
          className={
            isLoading
              ? `primary-btn px-16 text-2xl generateKey`
              : isError
              ? `primary-btn-error`
              : success
              ? `primary-btn-success w-full`
              : `primary-btn`
          }
          disabled={
            !(repoUrl && selectedFolder && account && username) || isLoading
          }
          onClick={onCloneRepoClicked}>
          {isLoading
            ? 'Cloning Repo...'
            : isError
            ? 'Retry'
            : success
            ? 'Cloned Successfully!'
            : 'Clone'}
        </button>
        {isLoading && (
          <p className="text-xs text-gray-600 mt-2">
            This might take few seconds to minutes...
          </p>
        )}
      </div>
    );
  }

  function renderUpdateRemoteUrlDialog() {
    return (
      <div>
        <h1 className="text-2xl font-semibold">Update Remote Url</h1>
        <AccountDropdown />
        <UserNameDropDown />
        <label className="text-gray-800 block text-left text-base mt-4 font-semibold">
          Select Repo Folder
        </label>
        <div className="relative mb-6 mt-2">
          <input
            type="text"
            className="text-gray-600 text-base bg-gray-100 px-4 py-2 rounded border-2 w-full focus:outline-none"
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
              ? `primary-btn px-16 text-2xl generateKey`
              : isError
              ? `primary-btn-error`
              : success
              ? `primary-btn-success w-full`
              : `primary-btn`
          }
          disabled={!(repoFolder && account && username) || isLoading}
          onClick={onUpdateRemoteUrlClicked}>
          {isLoading
            ? 'Upating Remote Url...'
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
    <div className="bg-gray-300 h-screen">
      <Toolbar onBackPressed={goBackToHomeScreen} title="Update Remote" />
      <h2 className="mx-16 mt-8 text-2xl text-center text-gray-900">
        Clone Repo or Update Remote Url
      </h2>
      <p className="text-sm text-gray-700 text-center">
        (Note : You will be only be able to clone repo or update remote url if
        you have setup SSH keys using this App.)
      </p>
      <div className="text-center mt-16">
        <Modal
          {...cloneRepoModalProps}
          buttonRef={cloneRepoButtonRef}
          onModalClose={onCloneRepoModalClose}>
          {renderCloneRepoDialog()}
        </Modal>
        <p className="mt-2">
          (Use this if your cloning this repository first time on your system)
        </p>
        <p className="my-4">OR</p>
        <Modal
          {...updateRepoModalProps}
          buttonRef={updateRemoteUrlButtonRef}
          onModalClose={onUpdateRemoteUrlModalClose}>
          {renderUpdateRemoteUrlDialog()}
        </Modal>
        <p className="mt-2">
          (Use this if your already have repository on your system)
        </p>
      </div>
    </div>
  );
}

const cloneRepoModalProps = {
  triggerText: 'Clone Repo',
  buttonClassName: 'primary-btn w-64',
  role: 'dialog',
  ariaLabel: 'Dialog to ask for details for cloning a repo',
};

const updateRepoModalProps = {
  triggerText: 'Update Remote Url',
  buttonClassName:
    'w-64 px-6 py-2 text-gray-100 bg-orange-500 hover:bg-orange-400 text-xl font-bold rounded inline-block',
  role: 'dialog',
  ariaLabel: 'Dialog to ask for details for updating remote url',
};

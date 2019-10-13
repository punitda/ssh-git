import React, { useRef, useState, useEffect, useReducer } from 'react';

import { history } from '../../App';

// Constants
import {
  SELECT_GIT_FOLDER_REQUEST_CHANNEL,
  SELECT_GIT_FOLDER_RESPONSE_CHANNEL,
  CLONE_REPO_REQUEST_CHANNEL,
  CLONE_REPO_RESPONSE_CHANNEL,
  SYSTEM_DESKTOP_FOLDER_PATH_REQUEST_CHANNEL,
  SYSTEM_DESKTOP_FOLDER_PATH_RESPONSE_CHANNEL,
  SSH_CONFIG_REQUEST_CHANNEL,
  SSH_CONFIG_RESPONSE_CHANNEL,
  UPDATE_REMOTE_URL_REQUEST_CHANNEL,
  UPDATE_REMOTE_URL_RESPONSE_CHANNEL,
  SHOW_ERROR_DIALOG_REQUEST_CHANNEL,
} from '../../../lib/constants';

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
    window.ipcRenderer.on(
      SELECT_GIT_FOLDER_RESPONSE_CHANNEL,
      folderSelectedListener
    );

    return () => {
      window.ipcRenderer.removeListener(
        SELECT_GIT_FOLDER_RESPONSE_CHANNEL,
        folderSelectedListener
      );
    };
  }, []);

  useEffect(() => {
    window.ipcRenderer.on(CLONE_REPO_RESPONSE_CHANNEL, cloneRepoResultListener);

    return () => {
      window.ipcRenderer.removeListener(
        CLONE_REPO_RESPONSE_CHANNEL,
        cloneRepoResultListener
      );
    };
  }, []);

  useEffect(() => {
    window.ipcRenderer.send(SSH_CONFIG_REQUEST_CHANNEL);

    window.ipcRenderer.on(SSH_CONFIG_RESPONSE_CHANNEL, sshConfigResultListener);
    return () => {
      window.ipcRenderer.removeListener(
        SSH_CONFIG_RESPONSE_CHANNEL,
        sshConfigResultListener
      );
    };
  }, []);

  useEffect(() => {
    // Making sure that we ask for desktop folder path only
    // when `selectedFolder` is empty('') which would happen
    // in case "clone repo" dialog is closed and re-opened again.
    if (!selectedFolder) {
      window.ipcRenderer.send(SYSTEM_DESKTOP_FOLDER_PATH_REQUEST_CHANNEL);
    }
    window.ipcRenderer.on(
      SYSTEM_DESKTOP_FOLDER_PATH_RESPONSE_CHANNEL,
      desktopFolderPathListener
    );

    return () => {
      window.ipcRenderer.removeListener(
        SYSTEM_DESKTOP_FOLDER_PATH_RESPONSE_CHANNEL,
        desktopFolderPathListener
      );
    };
  }, [selectedFolder]);

  useEffect(() => {
    window.ipcRenderer.on(
      UPDATE_REMOTE_URL_RESPONSE_CHANNEL,
      remoteUrlUpdateResultListener
    );

    return () => {
      window.ipcRenderer.removeListener(
        UPDATE_REMOTE_URL_RESPONSE_CHANNEL,
        remoteUrlUpdateResultListener
      );
    };
  }, []);

  // Event listener listening for desktop folder path of system to show it selected by default in UI when cloning repo.
  function desktopFolderPathListener(_event, path) {
    setSelectedFolder(path);
  }

  // Event listener listening to ssh config values coming in from main process
  // to be used for allowing user to select account and username
  function sshConfigResultListener(
    _event,
    { success = false, error = null, sshConfig = null }
  ) {
    if (success) {
      setSshConfig(sshConfig);
    } else {
      window.ipcRenderer.send(
        SHOW_ERROR_DIALOG_REQUEST_CHANNEL,
        error ? error : 'Something went wrong when parsing ssh config file :('
      );
    }
  }

  // Event listener to receive folder path that is selected by user when changing the default folder
  function folderSelectedListener(_event, filePaths) {
    if (filePaths && filePaths.length > 0) {
      setSelectedFolder(filePaths[0]);
      setRepoFolder(filePaths[0]);
    }
  }

  // Event listener for `git clone` command results.
  function cloneRepoResultListener(_event, { success, error, repoFolder }) {
    if (success) {
      dispatch({ type: 'FETCH_SUCCESS', payload: { success: true } });
      setTimeout(() => {
        openFolder(repoFolder);
      }, 1000);
    } else {
      dispatch({ type: 'FETCH_ERROR' });
      window.ipcRenderer.send(
        SHOW_ERROR_DIALOG_REQUEST_CHANNEL,
        error.message
          ? error.message
          : 'Something went wrong when cloning the repo :('
      );
    }
  }

  function remoteUrlUpdateResultListener(_event, { success, error }) {
    if (success) {
      dispatch({ type: 'FETCH_SUCCESS', payload: { success: true } });
    } else {
      dispatch({ type: 'FETCH_ERROR' });
      window.ipcRenderer.send(
        SHOW_ERROR_DIALOG_REQUEST_CHANNEL,
        error.message
          ? error.message
          : 'Something went wrong when updating remote url of the repo :('
      );
    }
  }

  function goBackToHomeScreen() {
    history.navigate('');
  }

  // Click listener for "select folder" action
  function changeDefaultFolder() {
    window.ipcRenderer.send(SELECT_GIT_FOLDER_REQUEST_CHANNEL);
  }

  // Click listener for "Clone Repo" button
  function cloneRepo() {
    dispatch({ type: 'FETCH_INIT' });
    window.ipcRenderer.send(CLONE_REPO_REQUEST_CHANNEL, {
      selectedProvider: account,
      username,
      repoUrl,
      selectedFolder,
    });
  }

  function updateRemoteUrl() {
    dispatch({ type: 'FETCH_INIT' });
    window.ipcRenderer.send(UPDATE_REMOTE_URL_REQUEST_CHANNEL, {
      selectedProvider: account,
      username,
      repoFolder,
    });
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
            onClick={changeDefaultFolder}
            readOnly
          />
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 hover:text-gray-800 px-4 text-center absolute right-0 top-0 bottom-0 rounded-r focus:outline-none"
            onClick={changeDefaultFolder}>
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
          onClick={cloneRepo}>
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
            onClick={changeDefaultFolder}
          />
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 hover:text-gray-800 px-4 text-center absolute right-0 top-0 bottom-0 rounded-r focus:outline-none "
            onClick={changeDefaultFolder}>
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
          onClick={updateRemoteUrl}>
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

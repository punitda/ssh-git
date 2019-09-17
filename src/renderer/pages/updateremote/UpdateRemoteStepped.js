import React, {
  useRef,
  useState,
  useEffect,
  useReducer,
  useContext,
} from 'react';

import { history } from '../../App';

import Modal from '../../components/Modal';

import { openFolder } from '../../../lib/app-shell';

import {
  SELECT_GIT_FOLDER_REQUEST_CHANNEL,
  SELECT_GIT_FOLDER_RESPONSE_CHANNEL,
  CLONE_REPO_REQUEST_CHANNEL,
  CLONE_REPO_RESPONSE_CHANNEL,
  SHOW_ERROR_DIALOG_REQUEST_CHANNEL,
  SYSTEM_DESKTOP_FOLDER_PATH_REQUEST_CHANNEL,
  SYSTEM_DESKTOP_FOLDER_PATH_RESPONSE_CHANNEL,
  UPDATE_REMOTE_URL_REQUEST_CHANNEL,
  UPDATE_REMOTE_URL_RESPONSE_CHANNEL,
} from '../../../lib/constants';

import fetchReducer from '../../reducers/fetchReducer';
import { ClientStateContext } from '../../Context';

export default function UpdateRemoteStepped() {
  const clientStateContext = useContext(ClientStateContext);
  const {
    username = null,
    selectedProvider = null,
  } = clientStateContext.authState;

  const cloneRepoButtonRef = useRef(null); //Used in clone repo modal for focusing reason
  const updateRemoteUrlButtonRef = useRef(null); // Used in update remote modal for focusing reason

  const [repoUrl, setRepoUrl] = useState(''); // Stores repourl entered by user
  const [selectedFolder, setSelectedFolder] = useState(''); // Stores parent folder that user selects where to "clone repo"
  const [repoFolder, setRepoFolder] = useState(''); // Stores repoFolder user selects for which they are updating "remote url"

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

    window.ipcRenderer.on(CLONE_REPO_RESPONSE_CHANNEL, cloneRepoResultListener);

    window.ipcRenderer.on(
      UPDATE_REMOTE_URL_RESPONSE_CHANNEL,
      remoteUrlUpdateResultListener
    );

    return () => {
      window.ipcRenderer.removeListener(
        SELECT_GIT_FOLDER_RESPONSE_CHANNEL,
        folderSelectedListener
      );

      window.ipcRenderer.removeListener(
        CLONE_REPO_RESPONSE_CHANNEL,
        cloneRepoResultListener
      );

      window.ipcRenderer.removeListener(
        UPDATE_REMOTE_URL_RESPONSE_CHANNEL,
        remoteUrlUpdateResultListener
      );
    };
  }, [selectedProvider]);

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

  // Event listener when folder is selected by user when changing default folder
  function folderSelectedListener(_event, filePaths) {
    // Setting both selectedFolder(used to store parent folder for cloning repo)
    // and repoFolder(used to store selected repo folder for updating remote url)
    // because we've setup one listener for both.
    // As we're clearing this state on both dialog close this shouldn't be a concern.
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
        error ? error : 'Something went wrong when updating remote url :('
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
        error ? error : 'Something went wrong when cloning the repo :('
      );
    }
  }

  function desktopFolderPathListener(_event, path) {
    setSelectedFolder(path);
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
      selectedProvider,
      username,
      repoUrl,
      selectedFolder,
    });
  }

  function updateRemoteUrl() {
    dispatch({ type: 'FETCH_INIT' });
    window.ipcRenderer.send(UPDATE_REMOTE_URL_REQUEST_CHANNEL, {
      selectedProvider,
      username,
      repoFolder,
    });
  }

  // Listen to onClose event of Modal component to reset local state for "Clone Repo" Modal.
  function onCloneRepoModalClose() {
    setRepoUrl('');
    setSelectedFolder('');
    setRepoFolder('');
    dispatch({ type: 'FETCH_RESET' });
  }

  // Listen to onClose event of Modal component to reset local state for "Update Remote Url" Modal.
  function onUpdateRemoteUrlModalClose() {
    setRepoFolder('');
    setSelectedFolder('');
    dispatch({ type: 'FETCH_RESET' });
  }

  function renderCloneRepoDialog() {
    return (
      <div>
        <h1 className="text-2xl font-semibold">Clone Repo</h1>
        <label className="text-gray-800 block text-left text-base mt-6 font-semibold">
          Repo url
        </label>
        <input
          type="text"
          className="text-gray-600 text-base bg-gray-100 px-4 py-2 mt-2 rounded border-2 w-full"
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
        <div className="relative mb-6 mt-2">
          <input
            type="text"
            className="text-gray-600 text-base bg-gray-100 px-4 py-2 rounded border-2 w-full focus:outline-none"
            value={selectedFolder}
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
          disabled={!(repoUrl && selectedFolder)}
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
          disabled={!repoFolder}
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
    <div className="bg-gray-300">
      <h2 className="mx-16 mt-8 text-2xl text-center text-gray-900">
        All Setup ✅
      </h2>
      <h3 className="text-center text-xl text-gray-700">
        You can now clone your repo or update remote url of existing repo using
        the SSH key.
      </h3>
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
        <p className="my-4 text-xl">OR</p>
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

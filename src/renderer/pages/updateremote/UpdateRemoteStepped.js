import React, {
  useRef,
  useState,
  useEffect,
  useReducer,
  useContext,
} from 'react';

import { history } from '../../App';

import Modal from '../../components/Modal';

import {
  SELECT_GIT_FOLDER_REQUEST_CHANNEL,
  SELECT_GIT_FOLDER_RESPONSE_CHANNEL,
  CLONE_REPO_REQUEST_CHANNEL,
  CLONE_REPO_RESPONSE_CHANNEL,
  SHOW_ERROR_DIALOG_REQUEST_CHANNEL,
} from '../../../lib/constants';

import fetchReducer from '../../reducers/fetchReducer';
import { ClientStateContext } from '../../Context';

export default function UpdateRemoteStepped() {
  const clientStateContext = useContext(ClientStateContext);
  const {
    username = null,
    selectedProvider = null,
  } = clientStateContext.authState;

  const cloneRepoButtonRef = useRef(null); //Used in modal for focusing reason
  const updateRemoteUrlButtonRef = useRef(null); // Used in modal for focusing reason

  const [repoUrl, setRepoUrl] = useState(''); // Stores repourl entered by user
  const [repoFolder, setRepoFolder] = useState('default'); // Stores selected folder where to clone the repo

  const [
    { isLoading: isCloning, isError, data: clonedSuccess },
    dispatch,
  ] = useReducer(fetchReducer, {
    isLoading: false,
    isError: false,
    data: null,
  });

  useEffect(() => {
    window.ipcRenderer.on(
      SELECT_GIT_FOLDER_RESPONSE_CHANNEL,
      folderSelectedListener
    );

    window.ipcRenderer.on(CLONE_REPO_RESPONSE_CHANNEL, cloneRepoResultListener);

    return () => {
      window.ipcRenderer.removeListener(
        SELECT_GIT_FOLDER_RESPONSE_CHANNEL,
        folderSelectedListener
      );

      window.ipcRenderer.removeListener(
        CLONE_REPO_RESPONSE_CHANNEL,
        cloneRepoResultListener
      );
    };
  }, [selectedProvider]);

  // Event listener when folder is selected by user when changing default folder
  function folderSelectedListener(_event, filePaths) {
    if (filePaths && filePaths.length > 0) {
      setRepoFolder(filePaths[0]);
    }
  }

  // Event listener for `git clone` command results.
  function cloneRepoResultListener(_event, { success, error }) {
    if (success) {
      dispatch({ type: 'FETCH_SUCCESS', payload: { clonedSuccess: true } });
    } else {
      dispatch({ type: 'FETCH_ERROR' });
      window.ipcRenderer.send(
        SHOW_ERROR_DIALOG_REQUEST_CHANNEL,
        error ? error : 'Something went wrong when cloning the repo :('
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
      selectedProvider,
      username,
      repoUrl,
      repoFolder,
    });
  }

  // Listen to onClose events of Modal component to reset local state.
  function onCloneRepoModalClose() {
    setRepoUrl('');
    setRepoFolder('default');
    dispatch({ type: 'FETCH_RESET' });
  }

  // To be implemented
  function onUpdateRemoteUrlModalClose() {}

  function renderCloneRepoDialog() {
    return (
      <div>
        <h1 className="text-2xl font-semibold">Clone Repo</h1>
        <label className="text-gray-800 block text-left text-base mt-6 font-semibold">
          Repo url
        </label>
        <input
          type="text"
          className="text-gray-600 text-lg bg-gray-100 px-4 py-2 mt-2 rounded border-2 w-full"
          placeholder="Enter your repository url."
          value={repoUrl}
          onChange={e => setRepoUrl(e.target.value)}
        />
        <p className="text-gray-700 mt-2 mb-8">
          [Example : git@github.com:nodejs/node.git]
        </p>
        <button
          className={
            isCloning
              ? `primary-btn px-16 text-2xl generateKey`
              : isError
              ? `primary-btn-error`
              : clonedSuccess
              ? `primary-btn-success`
              : `primary-btn`
          }
          disabled={!repoUrl}
          onClick={cloneRepo}>
          {isCloning
            ? 'Cloning Repo...'
            : isError
            ? 'Retry'
            : clonedSuccess
            ? 'Cloned Successfully!'
            : 'Clone'}
        </button>
        {isCloning && (
          <p className="text-xs text-gray-600">
            This might take few seconds to minutes
          </p>
        )}
        {repoFolder === 'default' ? (
          <p className="mt-4 text-sm text-gray-600">
            <span className="font-bold text-gray-700">{`Note: `}</span>
            This will clone your repo on the Desktop by default. To change
            default folder please{' '}
            <span
              className="font-bold underline text-gray-800 hover:text-blue-500 hover:bg-blue-100 cursor-pointer"
              onClick={changeDefaultFolder}>
              Select Folder
            </span>{' '}
            you want it to clone to.
          </p>
        ) : (
          <p className="mt-4 text-sm text-gray-600">
            Folder selected : <span className="font-bold">{repoFolder}</span>
          </p>
        )}
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
          <div>
            <h1 className="text-xl font-semibold">Update Remote Url</h1>
            <p className="mt-4">
              We can help update remote url of the repo. Bitch!!
            </p>
          </div>
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

import React, {
  useRef,
  useState,
  useEffect,
  useReducer,
  useContext,
} from 'react';

import Modal from '../../components/Modal';
import Switch from '../../components/Switch';

import { openFolder } from '../../../lib/app-shell';

import fetchReducer from '../../reducers/fetchReducer';
import { AuthStateContext } from '../../Context';

export default function UpdateRemoteStepped() {
  const [authState, setAuthState] = useContext(AuthStateContext);
  const { username = null, selectedProvider = null } = authState;

  const cloneRepoButtonRef = useRef(null); //Used in clone repo modal for focusing reason
  const updateRemoteUrlButtonRef = useRef(null); // Used in update remote modal for focusing reason

  const [repoUrl, setRepoUrl] = useState(''); // Stores repourl entered by user
  const [selectedFolder, setSelectedFolder] = useState(''); // Stores parent folder that user selects where to "clone repo"
  const [repoFolder, setRepoFolder] = useState(''); // Stores repoFolder user selects for which they are updating "remote url"

  const [shallowClone, setShallowClone] = useState(false); // Stores state whether to shallow clone based on user input

  const [{ isLoading, isError, data: success }, dispatch] = useReducer(
    fetchReducer,
    {
      isLoading: false,
      isError: false,
      data: null,
    }
  );

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
      selectedProvider,
      username,
      repoUrl,
      selectedFolder,
      shallowClone,
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
      selectedProvider,
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

  // Listen to onClose event of Modal component to reset local state for "Clone Repo" Modal.
  function onCloneRepoModalClose() {
    setRepoUrl('');
    setSelectedFolder('');
    setRepoFolder('');
    setShallowClone(false);
    dispatch({ type: 'FETCH_RESET' });
  }

  // Listen to onClose event of Modal component to reset local state for "Update Remote Url" Modal.
  function onUpdateRemoteUrlModalClose() {
    setRepoFolder('');
    setSelectedFolder('');
    dispatch({ type: 'FETCH_RESET' });
  }

  function openShallowCloneInfoUrl() {
    // To be implemented with proper openExternal link
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
            onClick={openShallowCloneInfoUrl}>
            What is shallow clone?
          </span>
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
          disabled={!(repoUrl && selectedFolder) || isLoading}
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
              ? `primary-btn px-16 text-2xl generateKey`
              : isError
              ? `primary-btn-error`
              : success
              ? `primary-btn-success w-full`
              : `primary-btn`
          }
          disabled={!repoFolder || isLoading}
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

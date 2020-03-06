import React from 'react';

import { DialogOverlay, DialogContent } from '@reach/dialog';
import Switch from './Switch';

import { openFolder, openExternal } from '../../lib/app-shell';
import { web_base_url } from '../../lib/config';

import { trackEvent } from '../analytics';

function cloneRepoReducer(state, action) {
  switch (action.type) {
    case 'CLONE_INIT':
      return { ...state, isLoading: true, isError: false };
    case 'CLONE_SUCCESS':
      return {
        ...state,
        isLoading: false,
        success: action.payload,
        isError: false,
      };
    case 'CLONE_ERROR':
      return { ...state, isLoading: false, isError: true };
    case 'CLONE_RESET':
      return { ...state, isLoading: false, isError: false, success: false };
    default:
      throw new Error(`Invalid action.type: ${action.type}`);
  }
}

const CloneRepoDialog = ({ onDismiss, defaultSelectedFolder, SshKey }) => {
  const [repoUrl, setRepoUrl] = React.useState('');
  const [selectedFolder, setSelectedFolder] = React.useState(
    defaultSelectedFolder
  );
  const [shallowClone, setShallowClone] = React.useState(false);

  const [{ isLoading, isError, success }, dispatch] = React.useReducer(
    cloneRepoReducer,
    {
      isLoading: false,
      isError: false,
      success: false,
    }
  );

  async function onCloneRepoClicked() {
    dispatch({ type: 'CLONE_INIT' });

    const result = await window.ipc.callMain('clone-repo', {
      selectedProvider: SshKey.provider,
      username: SshKey.username,
      mode: SshKey.mode,
      repoUrl,
      selectedFolder,
      shallowClone,
    });

    const { success, repoFolder } = result;
    if (success) {
      dispatch({ type: 'CLONE_SUCCESS', payload: true });
      setTimeout(() => openFolder(repoFolder), 1000);
      trackEvent('clone-repo', `${SshKey.provider}-success`);
    } else {
      dispatch({ type: 'CLONE_ERROR' });
      trackEvent('clone-repo', `${SshKey.provider}-error`);
    }
  }

  async function onChangeSelectedFolderClicked() {
    const selectedFolder = await window.ipc.callMain('select-git-folder');
    if (selectedFolder) {
      setSelectedFolder(selectedFolder);
    }
  }

  return (
    <DialogOverlay onDismiss={onDismiss} className="c-modal-cover">
      <DialogContent aria-labelledby="clone-repo">
        <div className="c-modal">
          <button
            className="c-modal__close focus:outline-none"
            aria-labelledby="close-modal"
            onClick={onDismiss}>
            <span className="u-hide-visually" id="close-modal">
              Close
            </span>
            <svg className="c-modal__close-icon" viewBox="0 0 40 40">
              <path d="M 10,10 L 30,30 M 30,10 L 10,30"></path>
            </svg>
          </button>
          <h1 className="mt-4 text-2xl font-semibold" id="clone-repo">
            Clone Repo
          </h1>
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
              onClick={onChangeSelectedFolderClicked}>
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
      </DialogContent>
    </DialogOverlay>
  );
};

export default CloneRepoDialog;

import React from 'react';

import { DialogContent, DialogOverlay } from '@reach/dialog';

function updateRemoteReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_REMOTE_INIT':
      return { ...state, isLoading: true, isError: false };
    case 'UPDATE_REMOTE_SUCCESS':
      return {
        ...state,
        isLoading: false,
        success: action.payload,
        isError: false,
      };
    case 'UPDATE_REMOTE_ERROR':
      return { ...state, isLoading: false, isError: true };
    case 'UPDATE_REMOTE_RESET':
      return { ...state, isLoading: false, isError: false, success: false };
    default:
      throw new Error(`Invalid action.type: ${action.type}`);
  }
}

const UpdateRemoteDialog = ({ onDismiss, defaultSelectedFolder, SshKey }) => {
  const [selectedFolder, setSelectedFolder] = React.useState(
    defaultSelectedFolder
  );

  const [{ isLoading, isError, success }, dispatch] = React.useReducer(
    updateRemoteReducer,
    {
      isLoading: false,
      isError: false,
      success: false,
    }
  );

  async function onChangeSelectedFolderClicked() {
    const selectedFolder = await window.ipc.callMain('select-git-folder');
    if (selectedFolder) {
      setSelectedFolder(selectedFolder);
    }
  }

  async function onUpdateRemoteUrlClicked() {
    dispatch({ type: 'UPDATE_REMOTE_INIT' });

    const result = await window.ipc.callMain('update-remote-url', {
      selectedProvider: SshKey.provider,
      username: SshKey.username,
      repoFolder: selectedFolder,
    });

    const { success } = result;

    if (success) {
      dispatch({ type: 'UPDATE_REMOTE_SUCCESS', payload: true });
    } else {
      dispatch({ type: 'UPDATE_REMOTE_ERROR' });
    }
  }

  return (
    <DialogOverlay onDismiss={onDismiss} className="c-modal-cover">
      <DialogContent aria-labelledby="update-remote">
        <div className="c-modal">
          <button
            className="c-modal__close"
            aria-labelledby="close-modal"
            onClick={onDismiss}>
            <span className="u-hide-visually" id="close-modal">
              Close
            </span>
            <svg className="c-modal__close-icon" viewBox="0 0 40 40">
              <path d="M 10,10 L 30,30 M 30,10 L 10,30"></path>
            </svg>
          </button>
          <h1 className="mt-4 text-2xl font-semibold" id="update-remote">
            Update Remote Url
          </h1>
          <label className="text-gray-800 block text-left text-base mt-4 font-semibold">
            Select Repo Folder
          </label>
          <div className="relative mb-6 mt-2">
            <input
              type="text"
              className="text-gray-800 text-base bg-gray-100 px-4 py-2 rounded border-2 w-full focus:outline-none"
              value={selectedFolder}
              placeholder="Select Repo Folder"
              readOnly
              onClick={onChangeSelectedFolderClicked}
            />
            <button
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 hover:text-gray-800 px-4 text-center absolute right-0 top-0 bottom-0 rounded-r focus:outline-none "
              onClick={onChangeSelectedFolderClicked}>
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
            disabled={!selectedFolder || isLoading}
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
      </DialogContent>
    </DialogOverlay>
  );
};

export default UpdateRemoteDialog;

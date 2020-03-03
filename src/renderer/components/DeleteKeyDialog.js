import React from 'react';

import { DialogOverlay, DialogContent } from '@reach/dialog';

const DeleteKeyDialog = ({ onDismiss, onKeyDeleted, SshKey }) => {
  return (
    <DialogOverlay onDismiss={onDismiss} className="c-modal-cover">
      <DialogContent aria-labelledby="confirmation">
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
          <div className="flex flex-col justify-center">
            <div className="flex justify-start items-center mt-4">
              <svg
                className="h-6 w-6 text-red-600"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h1 className="text-2xl font-semibold ml-2" id="confirmation">
                Confirm
              </h1>
            </div>
            <h2 className="mt-4 text-gray-700 text-lg">
              {`Are you sure you want to delete SSH key for ${SshKey.provider} account?`}
            </h2>
            <div className="flex flex-row justify-end mt-4">
              <button
                className="px-6 py-2 text-base text-gray-600 hover:text-gray-700 bg-gray-200 hover:bg-gray-300 rounded font-bold focus:outline-none"
                onClick={onDismiss}>
                Cancel
              </button>

              <button
                onClick={onKeyDeleted}
                className="ml-4 px-6 py-2 text-base text-white bg-red-600 hover:bg-red-500 border-0 rounded border-transparent focus:outline-none">
                Delete Key
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </DialogOverlay>
  );
};

export default DeleteKeyDialog;

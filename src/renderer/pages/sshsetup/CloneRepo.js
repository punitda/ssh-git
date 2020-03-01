import React from 'react';

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

import { useStore } from '../../StoreProvider';
import { observer } from 'mobx-react-lite';

import CloneRepoDialog from '../../components/CloneRepoDialog';
import UpdateRemoteDialog from '../../components/UpdateRemoteDialog';

const CloneRepo = observer(() => {
  const { sessionStore } = useStore();

  const [showCloneRepoDialog, setShowCloneRepoDialog] = React.useState(false);
  const [showUpdateRemoteDialog, setShowUpdateRemoteDialog] = React.useState(
    false
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

  const [desktopFolder, setDesktopFolder] = React.useState('');

  React.useEffect(() => {
    // Making sure that we ask for desktop folder path only
    // when `selectedFolder` is empty('') which would happen
    // in case "clone repo" dialog is closed and re-opened again and during 1st time when selectedFolder isn't set yet.
    async function getSystemDesktopFolderPath() {
      const desktopFolderPath = await window.ipc.callMain(
        'get-system-desktop-path'
      );
      setDesktopFolder(desktopFolderPath);
    }
    if (!desktopFolder) {
      getSystemDesktopFolderPath();
    }
  }, [desktopFolder]);

  // Close all notifications on unmount.
  // Using unmount method of useEffect() to remove all notifications displayed.
  React.useEffect(() => {
    return () => {
      toaster.closeAll();
    };
  }, []);

  const openCloneRepoDialog = () => setShowCloneRepoDialog(true);
  const closeCloneRepoDialog = () => setShowCloneRepoDialog(false);

  const openUpdateRemoteDialog = () => setShowUpdateRemoteDialog(true);
  const closeUpdateRemoteDialog = () => setShowUpdateRemoteDialog(false);

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
          <button
            className="primary-btn w-56 focus:outline-none"
            onClick={openCloneRepoDialog}>
            Clone Repo
          </button>

          {showCloneRepoDialog ? (
            <CloneRepoDialog
              onDismiss={closeCloneRepoDialog}
              defaultSelectedFolder={desktopFolder}
              SshKey={sessionStore}
            />
          ) : null}

          {sessionStore.mode === 'MULTI' ? (
            <>
              <p className="text-gray-700 text-xs mt-2">
                (Use this if your cloning this repository first time on your
                system)
              </p>

              <p className="my-4 text-xl">OR</p>

              <button
                className="secondary-btn w-56 focus:outline-none"
                onClick={openUpdateRemoteDialog}>
                Update Remote
              </button>

              {showUpdateRemoteDialog ? (
                <UpdateRemoteDialog
                  onDismiss={closeUpdateRemoteDialog}
                  defaultSelectedFolder={desktopFolder}
                  SshKey={sessionStore}
                />
              ) : null}

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

import React from 'react';

import { useNavigate } from '@reach/router';

import { observer } from 'mobx-react-lite';
import { useStore } from '../StoreProvider';

import logo from '../../assets/logo/icon.png';
import PlusIcon from '../../assets/icons/plus_icon.svg';

import ProviderAccordion from '../components/ProviderAccordion';
import ActionToolbar from '../components/ActionToolbar';
import CloneRepoDialog from '../components/CloneRepoDialog';
import UpdateRemoteDialog from '../components/UpdateRemoteDialog';
import InputDialog from '../components/InputDialog';

import DeleteKeyDialog from '../components/DeleteKeyDialog';
import toaster, { Position } from 'toasted-notes';

const Home = observer(() => {
  const { keyStore } = useStore();
  const navigate = useNavigate();

  const [currentKey, setCurrentKey] = React.useState(null);
  const [desktopFolder, setDesktopFolder] = React.useState('');

  const [showCloneDialog, setShowCloneRepoDialog] = React.useState(false);
  const [showUpdateRemoteDialog, setShowUpdateRemoteDialog] = React.useState(
    false
  );
  const [showInputNameDialog, setShowInputNameDialog] = React.useState(false);
  const [showInputLabelDialog, setShowInputLabelDialog] = React.useState(false);
  const [showDeleteKeyDialog, setShowDeleteKeyDialog] = React.useState(false);

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

  const openInputNameDialog = () => setShowInputNameDialog(true);
  const closeInputNameDialog = () => setShowInputNameDialog(false);

  const openInputLabelDialog = () => setShowInputLabelDialog(true);
  const closeInputLabelDialog = () => setShowInputLabelDialog(false);

  const openDeleteKeyDialog = () => setShowDeleteKeyDialog(true);
  const closeDeleteKeyDialog = () => setShowDeleteKeyDialog(false);

  function onUserNameAdded(username) {
    closeInputNameDialog();
    keyStore.addUsername(currentKey, username);
  }

  function onLabelAdded(label) {
    closeInputLabelDialog();
    keyStore.addLabel(currentKey, label);
  }

  async function onKeyDeleted() {
    // 1. Close Dialog immediately
    closeDeleteKeyDialog();

    // 2. Notify user about deleting key giving indication that we've started with delete key action
    toaster.notify(
      () => {
        return (
          <div className="py-2 px-4 rounded shadow-md bg-blue-500 text-white font-semibold text-center text-lg mt-20 mr-4">
            Deleting Key...
          </div>
        );
      },
      { duration: 1000, position: Position['top'] }
    );

    // 3. Send ipc event to delete the key
    const keyDeleted = await window.ipc.callMain('delete-key', currentKey);

    // 4. Once the key is deleted do following:
    // a. Remove the key from keyStore so UI is updated with that particular key removed
    // b. Notify user that key was deleted successfully with some 1.5s delay to avoid overlap with initial notification
    if (keyDeleted) {
      keyStore.removeKey(currentKey);
      setTimeout(
        () =>
          toaster.notify(
            () => {
              return (
                <div className="py-2 px-4 rounded shadow-md bg-green-500 text-white font-semibold text-center text-lg mt-20 mr-4">
                  Key Deleted Successfully!
                </div>
              );
            },
            { duration: 2000, position: Position['top'] }
          ),
        1500
      );
    }
  }

  async function refreshStore() {
    const storeSnapshot = await window.ipc.callMain('import-store');
    keyStore.clear();
    keyStore.addKeys(storeSnapshot);
    toaster.notify(
      () => {
        return (
          <div className="py-2 px-4 rounded shadow-md bg-blue-500 text-white font-semibold text-center text-lg mt-20 mr-4">
            Updated Successfully
          </div>
        );
      },
      { duration: 1000, position: Position['top'] }
    );
  }

  function onActionClicked(actionType, key) {
    switch (actionType) {
      case 'CLONE_REPO':
        setCurrentKey(key);
        openCloneRepoDialog();
        break;
      case 'UPDATE_REMOTE':
        setCurrentKey(key);
        openUpdateRemoteDialog();
        break;
      case 'DELETE_KEY':
        setCurrentKey(key);
        openDeleteKeyDialog();
        break;
      case 'ADD_LABEL':
        setCurrentKey(key);
        openInputLabelDialog();
        break;
      case 'ADD_USERNAME':
        setCurrentKey(key);
        openInputNameDialog();
        break;
      default:
        break;
    }
  }

  return (
    <div className="app bg-gray-300 min-h-screen ">
      <ActionToolbar
        title="ssh-git"
        logo={logo}
        onPrimaryAction={() => navigate('/oauth/connect')}
      />
      <div className="my-12 flex flex-col justify-start flex-wrap max-w-2xl xl:max-w-4xl mx-auto">
        {keyStore.totalNoOfKeys > 0 ? (
          <div>
            <div className="flex flex-row justify-between items-center mb-12">
              <h1 className="inline text-lg text-gray-700 text-right">
                Total 🔑 :{' '}
                <span className="font-extrabold">{keyStore.totalNoOfKeys}</span>
              </h1>
              <svg
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                class="w-4 h-4 mr-2 text-gray-700 inline cursor-pointer"
                onClick={refreshStore}>
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            </div>
            <ProviderAccordion
              keys={keyStore.keysGroupByProvider}
              onNewSshKeyClicked={provider => {
                navigate('/oauth/connect', { state: { provider } });
              }}
              onActionClicked={onActionClicked}
            />
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center">
            <h1 className="text-2xl text-gray-700 font-semibold">
              No SSH keys found 😲
            </h1>
            <div
              className="mt-12 w-56 h-56 mx-4 flex flex-row justify-center items-center rounded-lg border-gray-500 border-2 border-dashed hover:border-blue-500 hover:bg-gray-200 cursor-pointer"
              onClick={() => navigate('/oauth/connect')}>
              <PlusIcon className="text-gray-700 w-8 h-8 font-semibold" />
              <h1 className="ml-2 text-xl text-gray-700">Setup SSH key</h1>
            </div>
          </div>
        )}
      </div>

      {showCloneDialog ? (
        <CloneRepoDialog
          onDismiss={closeCloneRepoDialog}
          defaultSelectedFolder={desktopFolder}
          SshKey={currentKey}
        />
      ) : null}

      {showUpdateRemoteDialog ? (
        <UpdateRemoteDialog
          onDismiss={closeUpdateRemoteDialog}
          defaultSelectedFolder={desktopFolder}
          SshKey={currentKey}
        />
      ) : null}

      {showInputNameDialog ? (
        <InputDialog
          title="Add Username"
          placeholder={`Enter ${currentKey.provider}'s username`}
          onDismiss={closeInputNameDialog}
          onInputAdded={onUserNameAdded}
        />
      ) : null}

      {showInputLabelDialog ? (
        <InputDialog
          title="Add Label"
          placeholder="Add Label to identify key"
          initialValue={currentKey.label}
          inputExample="E.x. Work or Personal"
          onDismiss={closeInputLabelDialog}
          onInputAdded={onLabelAdded}
        />
      ) : null}

      {showDeleteKeyDialog ? (
        <DeleteKeyDialog
          onDismiss={closeDeleteKeyDialog}
          onKeyDeleted={onKeyDeleted}
          SshKey={currentKey}
        />
      ) : null}
    </div>
  );
});

export default Home;

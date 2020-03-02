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

  const openCloneRepoDialog = () => setShowCloneRepoDialog(true);
  const closeCloneRepoDialog = () => setShowCloneRepoDialog(false);

  const openUpdateRemoteDialog = () => setShowUpdateRemoteDialog(true);
  const closeUpdateRemoteDialog = () => setShowUpdateRemoteDialog(false);

  const openInputNameDialog = () => setShowInputNameDialog(true);
  const closeInputNameDialog = () => setShowInputNameDialog(false);

  const openInputLabelDialog = () => setShowInputLabelDialog(true);
  const closeInputLabelDialog = () => setShowInputLabelDialog(false);

  function onUserNameAdded(username) {
    closeInputNameDialog();
    keyStore.addUsername(currentKey, username);
  }

  function onLabelAdded(label) {
    closeInputLabelDialog();
    keyStore.addLabel(currentKey, label);
  }

  function onActionClicked(actionType, key) {
    switch (actionType) {
      case 'CLONE_REPO':
        setCurrentKey(key);
        openCloneRepoDialog();
        break;
      case 'UPDATE_REMOTE':
        console.group('--- Updating Remote Url ---');
        console.log('mode: ', key.mode);
        console.log('username: ', key.username);
        console.log('provider: ', key.provider);
        console.groupEnd('--- Updating Remote Url ---');
        setCurrentKey(key);
        openUpdateRemoteDialog();
        break;
      case 'DELETE_KEY':
        console.group('--- Deleting Key ---');
        console.log('mode: ', key.mode);
        console.log('username: ', key.username);
        console.log('provider: ', key.provider);
        console.groupEnd('--- Deleting Key ---');
        break;
      case 'OPEN_PROFILE':
        console.group('--- Opening Profile ---');
        console.log('mode: ', key.mode);
        console.log('username: ', key.username);
        console.log('provider: ', key.provider);
        console.groupEnd('--- Opening   ---');
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
            <h1 className="text-lg text-gray-700 text-right mb-8">
              Total 🔑 :{' '}
              <span className="font-extrabold">{keyStore.totalNoOfKeys}</span>
            </h1>
            <ProviderAccordion
              keys={keyStore.keysGroupByProvider}
              onNewSshKeyClicked={_provider => {
                navigate('/oauth/connect');
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
          placeholder="Enter username"
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
    </div>
  );
});

export default Home;

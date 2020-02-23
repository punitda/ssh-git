import React from 'react';

import { useNavigate } from '@reach/router';

import { observer } from 'mobx-react-lite';
import { useStore } from '../StoreProvider';

import ProviderAccordion from '../components/ProviderAccordion';

import logo from '../../assets/logo/icon.png';
import PlusIcon from '../../assets/icons/plus_icon.svg';
import ActionToolbar from '../components/ActionToolbar';

const Home = observer(() => {
  const { keyStore } = useStore();
  const navigate = useNavigate();

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
    </div>
  );
});

export default Home;

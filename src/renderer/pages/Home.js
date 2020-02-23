import React from 'react';

import AlphaBadge from '../../assets/img/alpha_badge.svg';
import logo from '../../assets/logo/icon.png';

import { Reveal, RevealGlobalStyles, Animation } from 'react-genie';
import { trackScreen, trackEvent } from '../analytics';
import Typical from 'react-typical';

import { observer } from 'mobx-react-lite';
import { useStore } from '../StoreProvider';

import PlusIcon from '../../assets/icons/plus_icon.svg';
import ActionToolbar from '../components/ActionToolbar';

import ProviderAccordion from '../components/ProviderAccordion';

function renderLandingPage(navigateTo) {
  React.useEffect(() => {
    trackScreen('landing-screen');
  }, []);

  return (
    <div className="bg-gray-800 h-screen">
      <RevealGlobalStyles />
      <div className="flex justify-between">
        <AlphaBadge className="z-10" />
      </div>
      <div className="flex flex-col items-center pb-8">
        <Reveal delay={100}>
          <img src={logo} className="w-20 h-20" />
        </Reveal>
        <Reveal delay={200}>
          <h1 className="mt-2 font-semibold text-4xl mx-auto text-center text-gray-200">
            Painlessly manage ssh keys for{' '}
          </h1>
        </Reveal>
        <Reveal delay={500}>
          <Typical
            steps={TypicalSteps}
            loop={1}
            wrapper="span"
            className="font-semibold text-4xl mx-auto text-center text-gray-200"
          />
        </Reveal>
        <Reveal delay={300}>
          <h2 className="text-gray-200 text-lg mt-2 text-center">
            Setup SSH keys in seconds 🚀
          </h2>
        </Reveal>
        <div className="mt-12 flex flex-row justify-between items-center ">
          {steps.map((step, index) => (
            <Reveal delay={400 + (index + 1) * 100}>
              <div className="w-48 h-48 mr-8 flex flex-col items-center border-blue-500 border-r-2 border-b-2 rounded-lg shadow-2xl bg-gray-900">
                <div className="w-8 h-8 mt-4 text-gray-700 text-xl text-center font-semibold bg-gray-100 rounded-full shadow">
                  {index + 1}
                </div>
                <h1 className="mt-4 px-4 text-2xl text-center font-bold text-gray-400">
                  {step.title}
                </h1>
                <h2 className="mt-2 px-4 text-center text-xs font-semibold text-gray-400">
                  {step.content}
                </h2>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={1000} animation={Animation.SlideInRight}>
          <button
            className="w-48 px-4 py-2 mt-12 text-white text-xl font-semibold bg-blue-500 hover:bg-blue-700 rounded focus:outline-none"
            onClick={_e => {
              navigateTo('/oauth/connect');
              trackEvent('splash', 'setup-ssh');
            }}>
            Get Started
          </button>
        </Reveal>
      </div>
    </div>
  );
}

function renderHomePage(keyStore, navigateTo) {
  return (
    <div className="app bg-gray-300 min-h-screen ">
      <ActionToolbar
        title="ssh-git"
        logo={logo}
        onPrimaryAction={() => navigateTo('/oauth/connect')}
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
                navigateTo('/oauth/connect');
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
              onClick={() => navigateTo('/oauth/connect')}>
              <PlusIcon className="text-gray-700 w-8 h-8 font-semibold" />
              <h1 className="ml-2 text-xl text-gray-700">Setup SSH key</h1>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const Home = observer(({ navigateTo }) => {
  const { keyStore } = useStore();
  if (
    window.localStorage &&
    !window.localStorage.getItem('isLandingPageShown')
  ) {
    window.localStorage.setItem('isLandingPageShown', 'true');
    return renderLandingPage(navigateTo);
  } else {
    return renderHomePage(keyStore, navigateTo);
  }
});

export default Home;

const steps = [
  {
    title: 'Connect',
    content: 'Connect to your account',
  },
  {
    title: 'Generate',
    content: 'Generate passphrase protected SSH key',
  },
  {
    title: 'Add',
    content: 'Add generated SSH key to your account',
  },
  {
    title: 'Clone',
    content: 'You can now clone, push, pull your repo',
  },
];

const TypicalSteps = [
  'Github',
  2000,
  'Bitbucket',
  1000,
  'Gitlab',
  1000,
  '',
  1000,
  'Github, Bitbucket and Gitlab accounts',
];

import React from 'react';

import AlphaBadge from '../../assets/img/alpha_badge.svg';
import logo from '../../assets/logo/icon.png';

import { Reveal, RevealGlobalStyles, Animation } from 'react-genie';
import { trackScreen, trackEvent } from '../analytics';
import Typical from 'react-typical';

import { observer } from 'mobx-react-lite';
import { useStore } from '../StoreProvider';

import ActionToolbar from '../components/ActionToolbar';

import githublogo from '../../assets/img/github_logo.png';
import bitbucketlogo from '../../assets/img/bitbucket_logo.png';
import gitlablogo from '../../assets/img/gitlab_logo.png';

import PlusIcon from '../../assets/icons/plus_icon.svg';
import OverflowMenuIcon from '../../assets/icons/overflow_menu.svg';

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
      <h1 className="text-2xl text-gray-900 text-center mt-8">
        Manage SSH keys
      </h1>
      <button
        onClick={() => window.ipc.callMain('clear-store')}
        className="absolute right-0 top-0 bg-red-500 text-red-100 rounded mt-20 mr-2 p-2">
        Clear KeyStore
      </button>
      <div className="mt-12 flex flex-row justify-center flex-wrap items-center max-w-2xl mx-auto">
        {keyStore.sshKeys.map(key => {
          const image = images[key.provider];
          return (
            <div
              className="w-48 h-48 relative rounded-lg shadow-lg bg-gray-200 text-center mx-4 my-8"
              key={`${key.provider}-${key.path}`}>
              <img
                src={key.avatar_url ? key.avatar_url : image.icon}
                alt={`${image.name} avatar`}
                className="h-16 w-16 mx-auto object-cover rounded-full border-2 border-gray-200 shadow-lg -mt-8 bg-gray-200"
              />
              <OverflowMenuIcon className="w-6 h-6 text-gray-600 hover:text-gray-800 absolute right-0 top-0 mt-2" />
              {key.username ? (
                <h1 className="text-xl text-gray-800 font-semibold mt-4">
                  {key.username}
                </h1>
              ) : (
                <button
                  className="bg-blue-200 hover:bg-blue-300 text-blue-800 hover:text-blue-900 text-xs w-32 rounded-lg p-2 mt-4"
                  onClick={() => key.addUserName('punitda')}>
                  Add username
                </button>
              )}

              <button
                className="bg-red-200 hover:bg-red-300 text-red-800 hover:text-red-900 text-xs w-20 rounded-lg p-1 mt-4"
                onClick={() => key.addLabel('Home')}>
                {key.label ? key.label : 'Add label'}
              </button>

              <div className="absolute bottom-0 w-full">
                {key.mode === 'MULTI' ? (
                  <button className="bg-gray-300 hover:bg-gray-400 w-full h-12 text-gray-700 hover:text-gray-800 text-sm rounded-b-lg rounded-t-none">
                    Update Remote
                  </button>
                ) : (
                  <button className="bg-gray-300 hover:bg-gray-400 w-full h-12 text-gray-700 hover:text-gray-800 text-sm rounded-b-lg rounded-t-none">
                    Clone Repo
                  </button>
                )}
              </div>
            </div>
          );
        })}
        <div
          className="w-48 h-48 m-4 flex flex-row justify-center items-center rounded-lg border-gray-500 border-2 border-dashed hover:border-blue-500 hover:bg-gray-200 cursor-pointer"
          onClick={() => navigateTo('/oauth/connect')}>
          <PlusIcon className="text-gray-700 w-8 h-8 font-semibold" />
          <h1 className="ml-2 text-xl text-gray-700">New SSH key</h1>
        </div>
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

const images = {
  github: {
    displayName: 'GitHub',
    icon: githublogo,
  },
  bitbucket: {
    displayName: 'Bitbucket',
    icon: bitbucketlogo,
  },
  gitlab: {
    displayName: 'GitLab',
    icon: gitlablogo,
  },
};

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

import React from 'react';

import AlphaBadge from '../../assets/img/alpha_badge.svg';
import logo from '../../assets/logo/icon.png';

import { Reveal, RevealGlobalStyles, Animation } from 'react-genie';
import { trackScreen, trackEvent } from '../analytics';
import Typical from 'react-typical';

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
            Setup SSH keys in matter of secs 🚀
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

function renderHomePage(navigateTo) {
  return (
    <div className="app">
      <div className="flex justify-between">
        <AlphaBadge className="z-10" />
      </div>
      <div className="flex flex-col items-center pb-8">
        <img src={logo} className="w-20 h-20" />
        <h1 className="mt-2 font-semibold text-4xl text-gray-200 tracking-wide">
          ssh-git
        </h1>
        <button
          className="primary-btn w-56 mt-16"
          onClick={_e => {
            navigateTo('/oauth/connect');
            trackEvent('splash', 'setup-ssh');
          }}>
          Setup SSH
        </button>
        <button
          className="secondary-btn text-gray-300 w-56 mt-8"
          onClick={_e => {
            navigateTo('/updateRemoteDirect');
            trackEvent('splash', 'clone-or-update');
          }}>
          Clone or Update
        </button>
      </div>
    </div>
  );
}
export default function Home({ navigateTo }) {
  if (
    window.localStorage &&
    !window.localStorage.getItem('isLandingPageShown')
  ) {
    window.localStorage.setItem('isLandingPageShown', 'true');
    return renderLandingPage(navigateTo);
  } else {
    return renderHomePage(navigateTo);
  }
}

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
  1000,
];

import React from 'react';

import AlphaBadge from '../../assets/img/alpha_badge.svg';
import logo from '../../assets/logo/icon.png';

import { Reveal, RevealGlobalStyles, Animation } from 'react-genie';

function renderLandingPage(navigateTo) {
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
          <h1 className="mt-2 font-semibold text-4xl text-gray-200 tracking-wide">
            Welcome to ssh-git
          </h1>
        </Reveal>
        <Reveal delay={300}>
          <h2 className="text-gray-200 text-2xl text-center tracking-wide">
            Painlessly manage ssh keys for Github/Bitbucket/Gitlab
          </h2>
        </Reveal>
        <div className="mt-16 flex flex-row justify-between items-center ">
          {steps.map((step, index) => (
            <Reveal delay={400 + (index + 1) * 100}>
              <div className="w-48 h-48 mr-8 flex flex-col items-center bg-gray-700 rounded-lg shadow-lg">
                <div className="w-8 h-8 mt-4 text-gray-900 text-xl text-center font-semibold bg-gray-100 rounded-full shadow">
                  {index + 1}
                </div>
                <h1 className="mt-2 px-4 text-xl text-center font-bold text-gray-300">
                  {step.title}
                </h1>
                <h2 className="mt-4 px-4 text-center text-sm font-semibold text-gray-400">
                  {step.content}
                </h2>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={1000} animation={Animation.SlideInRight}>
          <button
            className="w-48 px-4 py-2 mt-12 text-white text-xl font-semibold bg-blue-500 hover:bg-blue-700 rounded focus:outline-none"
            onClick={_e => navigateTo('/oauth')}>
            Get Started
          </button>
        </Reveal>
      </div>
    </div>
  );
}

function renderHomePage(navigateTo) {
  return (
    <div className="bg-gray-300 h-screen">
      <div className="flex justify-between">
        <AlphaBadge className="z-10" />
      </div>
      <div className="flex flex-col items-center pb-8">
        <img src={logo} className="w-20 h-20" />
        <h1 className="mt-2 font-semibold text-4xl text-gray-800 tracking-wide">
          ssh-git
        </h1>
        <button
          className="primary-btn w-56 mt-16"
          onClick={_e => navigateTo('/oauth')}>
          Setup SSH
        </button>
        <button
          className="w-56 mt-8 secondary-btn"
          onClick={_e => navigateTo('/updateRemote')}>
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
    content: 'Connect to your account to get basic info',
  },
  {
    title: 'Generate',
    content: 'Add passphrase to protect and generate SSH key',
  },
  {
    title: 'Add',
    content: 'Add generated SSH key to your account',
  },
  {
    title: 'Clone',
    content: 'You can now clone your repos without typing any passwords!',
  },
];

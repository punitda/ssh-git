import React from 'react';

import AlphaBadge from '../../assets/img/alpha_badge.svg';
import logo from '../../assets/logo/icon.png';

export default function Home({ navigateTo }) {
  return (
    <div className="bg-gray-800 h-screen">
      <div className="flex justify-between">
        <AlphaBadge className="z-10" />
        <a
          className="mt-2 mr-4 text-gray-400 hover:text-gray-100 text-base hover:underline cursor-pointer"
          href="#">
          Help
        </a>
      </div>
      <div className="flex flex-col items-center pb-8">
        <img src={logo} className="w-20 h-20" />
        <h1 className="mt-2 font-semibold text-2xl text-gray-200 tracking-wide">
          Welcome to ssh-git
        </h1>
        <h2 className="text-gray-200 text-xl text-center tracking-wide">
          Painlessly manage ssh keys for Github/Bitbucket/Gitlab
        </h2>
        <button
          className="w-56 px-4 py-2 mt-16 text-white text-xl font-semibold bg-blue-500 hover:bg-blue-700 rounded focus:outline-none"
          onClick={_e => navigateTo('/oauth')}>
          Setup SSH
        </button>
        <button
          className="w-56 px-4 py-2 mt-8 text-gray-800 text-xl font-semibold bg-teal-300 hover:bg-teal-400 rounded focus:outline-none"
          onClick={_e => navigateTo('/updateRemote')}>
          Clone or Update
        </button>
      </div>
    </div>
  );
}

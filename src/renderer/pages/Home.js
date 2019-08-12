import React from 'react';

import AlphaBadge from '../../assets/img/alpha_badge.svg';

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
        <h1 className="mt-4 font-bold text-4xl text-white uppercase tracking-wider">
          ssh-git
        </h1>
        <button
          className="w-56 px-4 py-2 mt-20 text-white text-xl font-semibold bg-purple-700 hover:bg-purple-500 rounded focus:outline-none"
          onClick={_e => navigateTo('/oauth')}>
          Setup SSH
        </button>
        <button
          className="w-56 px-4 py-2 mt-8 text-gray-800 text-xl font-semibold bg-teal-300 hover:bg-teal-100 rounded focus:outline-none"
          onClick={_e => navigateTo('/updateRemote')}>
          Update Remote
        </button>
      </div>
    </div>
  );
}

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
        <h1 className="mt-4 font-bold text-5xl text-gray-200 uppercase tracking-wider">
          ssh-git
        </h1>
        <button
          className="w-64 px-4 py-2 mt-24 text-white text-2xl font-semibold bg-blue-700 hover:bg-blue-500 rounded focus:outline-none"
          onClick={_e => navigateTo('/oauth')}>
          Setup SSH
        </button>
        <button
          className="w-64 px-4 py-2 mt-8 text-gray-800 text-2xl font-semibold bg-orange-500 hover:bg-orange-400 rounded focus:outline-none"
          onClick={_e => navigateTo('/updateRemote')}>
          Clone or Update
        </button>
        <p className="text-gray-500 text-center mt-2">
          [Note : You will be only be able to clone repo or update remote url if
          you have setup SSH keys using this App.]
        </p>
      </div>
    </div>
  );
}

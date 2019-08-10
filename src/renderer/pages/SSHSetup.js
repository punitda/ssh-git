import React from 'react';

import LeftArrowSvg from '../../../public/assets/img/left_arrow.svg';
import { history } from '../App';

export default function SSHSetup() {
  function goBackToHomeScreen() {
    history.navigate('');
  }

  return (
    <div className="bg-gray-300 h-screen">
      <div className="bg-gray-700 p-3 flex items-center">
        <LeftArrowSvg onClick={goBackToHomeScreen} />
        <span className="text-gray-100 font-semibold text-xl ml-4">
          Setup SSH
        </span>
      </div>
      <div className="flex justify-center items-end bg-gray-400 pt-4">
        <div className="mr-12 text-xl font-bold text-gray-800 border-b-2 border-blue-500 pb-2">
          Connect
        </div>
        <div className="mr-12 text-xl text-gray-700 border-b-2 border-transparent pb-2">
          Generate
        </div>
        <div className="mr-12 text-xl text-gray-700 border-b-2 border-transparent pb-2">
          Add
        </div>
        <div className="mr-12 text-xl text-gray-700 border-b-2 border-transparent pb-2">
          Update
        </div>
      </div>
      <h1 className="text-2xl text-gray-900 font-semibold text-center mt-8">
        Please select platform to connect?
      </h1>
      <div className="flex justify-center mt-8">
        <button className="w-40 h-40 m-2 text-center bg-gray-200 rounded-lg shadow-lg font-semibold text-gray-900 text-xl">
          Github
        </button>
        <button className="w-40 h-40 m-2 text-center bg-gray-200 rounded-lg shadow-lg font-semibold text-blue-500 text-xl">
          Bitbucket
        </button>
        <button className="w-40 h-40 m-2 text-center bg-gray-200 rounded-lg shadow-lg font-semibold text-orange-500 text-xl">
          Gitlab
        </button>
      </div>
    </div>
  );
}

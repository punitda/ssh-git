import React from 'react';

import LeftArrowSvg from '../../../public/assets/img/left_arrow.svg';
import githublogo from '../../../public/assets/img/github_logo.png';
import bitbucketlogo from '../../../public/assets/img/bitbucket_logo.png';
import gitlablogo from '../../../public/assets/img/gitlab_logo.png';

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
      <div className="flex justify-center mt-16">
        <button className="flex flex-col items-center justify-center w-40 h-40 m-2 p-2 text-center bg-gray-200 rounded-lg shadow-lg font-semibold text-gray-900 text-xl focus:outline-none focus:bg-blue-200 focus:border-2 focus:border-blue-500">
          <img src={githublogo} width="48" height="48" alt="github logo" />
          <h2 className="pt-4">Github</h2>
        </button>
        <button className="flex flex-col items-center justify-center w-40 h-40 m-2 p-2 text-center bg-gray-200 rounded-lg shadow-lg font-semibold text-gray-900 text-xl focus:outline-none focus:bg-blue-200 focus:border-2 focus:border-blue-500">
          <img src={bitbucketlogo} width="56" height="56" alt="github logo" />
          <h2 className="pt-4">Bitbucket</h2>
        </button>
        <button className="flex flex-col items-center justify-center w-40 h-40 m-2 p-2 text-center bg-gray-200 rounded-lg shadow-lg font-semibold text-gray-900 text-xl focus:outline-none focus:bg-blue-200 focus:border-2 focus:border-blue-500">
          <img src={gitlablogo} width="64" height="64" alt="github logo" />
          <h2 className="pt-4">GitLab</h2>
        </button>
      </div>
      <div className="text-right mr-32 mt-8">
        <button className="px-6 py-2 text-gray-100 text-xl font-bold rounded bg-blue-500 hover:bg-blue-400 focus:bg-blue-600">
          Next
        </button>
      </div>
    </div>
  );
}

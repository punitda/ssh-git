import React from 'react';
import AlphaBadge from '../assets/img/alpha_badge.svg';

class App extends React.Component {
  render() {
    return (
      <div>
        <div className="pb-12">
          <AlphaBadge />
          <h1 className="text-center font-bold text-4xl text-purple-600 uppercase underline">
            ssh-git
          </h1>
          <p className="text-left px-16 pt-4 text-xl text-gray-800">
            ssh-git is a tool to help you generate, add and manage ssh keys for
            using git with dev platforms like Github, Bitbucket and Gitlab, etc.
            without you having to touch commandline for it.
          </p>
        </div>
        <hr className="border border-dashed" />
        <div className="flex flex-col items-center">
          <h2 className="text-xl py-8 font-semibold text-gray-700">
            Generate keys for
          </h2>
          <button className="rounded-lg font-semibold bg-gray-900 text-white py-2 m-2 w-40 text-xl">
            Github
          </button>
          <span className="text-gray-700 py-2">
            ----------------OR----------------
          </span>
          <button className="rounded-lg font-semibold bg-blue-500 text-white py-2 m-2 w-40 text-xl">
            Bitbucket
          </button>
          <span className="text-gray-700 py-2">
            ----------------OR----------------
          </span>
          <button className="rounded-lg font-semibold bg-orange-500 text-white p-2 m-2 w-40 text-xl">
            Gitlab
          </button>
        </div>
      </div>
    );
  }
}
export default App;

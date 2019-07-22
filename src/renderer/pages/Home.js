import React from 'react';
import uuid from 'uuid/v4';

import Wave from '../components/Wave';
import AlphaBadge from '../../assets/img/alpha_badge.svg';

import { openExternal } from '../../lib/app-shell';
import { oauth } from '../../lib/config';

const REDIRECT_URI = 'ssh-git://oauth';
const { github, bitbucket, gitlab } = oauth;

class Home extends React.Component {
  signInWithGithub() {
    const CLIENT_ID = github.client_id;
    const SCOPES = github.scopes;
    const STATE = uuid();
    const url = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=${SCOPES}&state=${STATE}`;
    openExternal(url);
  }

  signInWithBitbucket() {
    const CLIENT_ID = bitbucket.client_id;
    const SCOPES = bitbucket.scopes;
    const STATE = uuid();
    const url = `https://bitbucket.org/site/oauth2/authorize?client_id=${CLIENT_ID}&scope=${SCOPES}&response_type=token&state=${STATE}`;
    openExternal(url);
  }

  signInWithGitlab() {
    const CLIENT_ID = gitlab.client_id;
    const SCOPES = gitlab.scopes;
    const STATE = uuid();
    const url = `https://gitlab.com/oauth/authorize?client_id=${CLIENT_ID}&scope=${SCOPES}&redirect_uri=${REDIRECT_URI}&response_type=token&state=${STATE}`;
    openExternal(url);
  }

  render() {
    return (
      <div>
        <div className="flex flex-col items-center pb-8 bg-gradient-purple-black">
          <h1 className="mt-16 text-center font-bold text-4xl text-white uppercase underline">
            ssh-git
          </h1>
          <AlphaBadge className="fixed z-10 left-0 top-0" />
          <p className="text-left px-16 pt-4 text-xl  text-white">
            ssh-git is a tool to help you generate, add and manage ssh keys for
            using git with dev platforms like Github, Bitbucket and Gitlab, etc.
            without you having to touch commandline for it.
          </p>
          <button className="rounded-lg shadow-lg font-bold bg-teal-400 text-white active:bg-teal-600 py-2 mt-16 w-48 text-xl">
            Generate Keys
          </button>
        </div>
        <Wave />
        <div className="pt-16 flex flex-col items-center">
          <h2 className="text-xl py-8 font-semibold text-gray-700">
            Generate keys for
          </h2>
          <button
            onClick={this.signInWithGithub}
            className="rounded-lg shadow-lg font-semibold bg-gray-900 text-white py-2 m-2 w-40 text-xl">
            Github
          </button>
          <span className="text-gray-700 py-2">
            ----------------OR----------------
          </span>
          <button
            onClick={this.signInWithBitbucket}
            className="rounded-lg shadow-lg font-semibold bg-blue-500 text-white py-2 m-2 w-40 text-xl">
            Bitbucket
          </button>
          <span className="text-gray-700 py-2">
            ----------------OR----------------
          </span>
          <button
            onClick={this.signInWithGitlab}
            className="rounded-lg shadow-lg font-semibold bg-orange-500 text-white p-2 m-2 w-40 text-xl">
            Gitlab
          </button>
        </div>
      </div>
    );
  }
}
export default Home;

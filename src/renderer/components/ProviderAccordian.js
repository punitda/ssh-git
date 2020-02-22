import React from 'react';

import githublogo from '../../assets/img/github_logo.png';
import bitbucketlogo from '../../assets/img/bitbucket_logo.png';
import gitlablogo from '../../assets/img/gitlab_logo.png';

import PlusIcon from '../../assets/icons/plus_icon.svg';
import OverflowMenuIcon from '../../assets/icons/overflow_menu.svg';
import ChevronRight from '../../assets/icons/chevron_right.svg';
import ChevronDown from '../../assets/icons/chevron_down.svg';

const ProviderAccordian = ({ keys, onNewSshKeyClicked }) => {
  const [showProviders, setShowProviders] = React.useState({
    github: false,
    bitbucket: false,
    gitlab: false,
  });

  function toggleShowProvider(key) {
    showProviders[key] = !showProviders[key];
    const updatedProviders = { ...showProviders };
    setShowProviders(updatedProviders);
  }

  return Object.entries(keys).map(([key, value]) => {
    const image = images[key];
    return (
      <div key={`${key}`}>
        <div
          className="flex flex-row justify-between items-center border-b-2 border-solid border-gray-400 pb-2 mt-8"
          onClick={() => toggleShowProvider(key)}>
          <div className="flex items-center justify-start">
            <img
              src={image.icon}
              className="inline w-8 h-8 object-cover rounded-full"
            />
            <h1 className="inline text-gray-900 text-xl font-semibold capitalize ml-2">
              {key}
            </h1>
          </div>
          <div className="flex justify-end items-center">
            <span className="rounded-full w-6 h-6 bg-gray-400 text-center text-sm">
              {value.length}
            </span>
            {showProviders[key] ? (
              <ChevronDown className="w-6 h-6 text-gray-500" />
            ) : (
              <ChevronRight className="w-6 h-6 text-gray-500" />
            )}
          </div>
        </div>

        {showProviders[key] ? (
          <div className="mt-4 flex flex-row justify-start flex-wrap items-center max-w-2xl mx-auto py-4">
            {value && value.length > 0 ? (
              value.map((key, index) => (
                <div
                  className={`w-48 h-48 relative rounded-lg shadow-lg bg-gray-200 text-center ${
                    index === 0 ? `mx-0` : 'mx-6'
                  } my-4`}
                  key={`${key.provider}-${key.path}`}>
                  <img
                    src={key.avatar_url ? key.avatar_url : image.icon}
                    alt={`${image.name} avatar`}
                    className="h-12 w-12 mx-auto object-cover rounded-full border-2 border-gray-200 shadow-lg -mt-6 bg-gray-200"
                  />
                  <OverflowMenuIcon className="w-6 h-6 text-gray-600 hover:text-gray-800 absolute right-0 top-0 mt-2" />
                  {key.username ? (
                    <h1 className="text-xl text-gray-700 font-semibold mt-4">
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
              ))
            ) : (
              <div
                className="w-48 h-48 flex flex-row justify-center items-center rounded-lg border-gray-500 border-2 border-dashed hover:border-blue-500 hover:bg-gray-200 cursor-pointer"
                onClick={() => onNewSshKeyClicked(key)}>
                <PlusIcon className="text-gray-700 w-8 h-8 font-semibold" />
                <h1 className="ml-2 text-xl text-gray-700">New SSH key</h1>
              </div>
            )}
          </div>
        ) : null}
      </div>
    );
  });
};

export default ProviderAccordian;

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

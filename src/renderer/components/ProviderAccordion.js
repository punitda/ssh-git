import React from 'react';

import githublogo from '../../assets/img/github_logo.png';
import bitbucketlogo from '../../assets/img/bitbucket_logo.png';
import gitlablogo from '../../assets/img/gitlab_logo.png';

import PlusIcon from '../../assets/icons/plus_icon.svg';
import OverflowMenuIcon from '../../assets/icons/overflow_menu.svg';
import ChevronRight from '../../assets/icons/chevron_right.svg';
import ChevronDown from '../../assets/icons/chevron_down.svg';

const ProviderAccordion = ({ keys, onNewSshKeyClicked, onActionClicked }) => {
  const [showProviderKeys, setShowProviderKeys] = React.useState({
    github: false,
    bitbucket: false,
    gitlab: false,
  });

  function toggleShowProvider(key) {
    showProviderKeys[key] = !showProviderKeys[key];
    const updatedProviders = { ...showProviderKeys };
    setShowProviderKeys(updatedProviders);
  }

  return Object.entries(keys).map(([provider, keys]) => {
    const image = images[provider];
    return (
      <div key={`${provider}`}>
        <div
          className="flex flex-row justify-between items-center border-b-2 border-solid border-gray-400 pb-2 mt-2"
          onClick={() => toggleShowProvider(provider)}>
          <div className="flex items-center justify-start">
            <img
              src={image.icon}
              className="inline w-8 h-8 object-cover rounded-full"
            />
            <h1 className="inline text-gray-900 text-xl font-semibold capitalize ml-2">
              {provider}
            </h1>
          </div>
          <div className="flex justify-end items-center">
            <span className="rounded-full w-6 h-6 bg-gray-400 text-center text-sm">
              {keys.length}
            </span>
            {showProviderKeys[provider] ? (
              <ChevronDown className="w-6 h-6 text-gray-500" />
            ) : (
              <ChevronRight className="w-6 h-6 text-gray-500" />
            )}
          </div>
        </div>

        {showProviderKeys[provider] ? (
          <div className="grid grid-cols-3 xl:grid-cols-4 gap-5 my-8">
            {keys && keys.length > 0 ? (
              keys.map(key => (
                <div
                  className="w-48 h-48 relative rounded-lg shadow-lg bg-gray-200 text-center mt-4"
                  key={`${key.path}`}>
                  <img
                    src={key.avatar_url ? key.avatar_url : image.icon}
                    alt={`${image.name} avatar`}
                    className="h-12 w-12 mx-auto object-cover rounded-full border-2 border-gray-200 shadow-lg -mt-6 bg-gray-200"
                  />
                  <div className="absolute right-0 top-0 mt-2">
                    <div className="group inline-block relative">
                      <OverflowMenuIcon className="w-6 h-6 text-gray-600 hover:text-gray-800" />
                      <ul className="hidden group-hover:block absolute right-0 top-0 text-gray-700 mr-1 mt-6 z-10 text-sm rounded-md bg-white shadow-xs">
                        {key.mode === 'SINGLE'
                          ? singleModeActions.map((action, index) => (
                              <li
                                className={`${index === 0 ? `rounded-t` : ``} ${
                                  index === 2
                                    ? `rounded-b`
                                    : `border-b-2 border-gray-200`
                                } bg-gray-100 hover:bg-gray-300 py-2 px-4 block whitespace-no-wrap`}
                                key={action.name}
                                onClick={_e =>
                                  onActionClicked(action.type, key)
                                }>
                                {action.name}
                              </li>
                            ))
                          : multiModeActions.map((action, index) => (
                              <li
                                className={`${index === 0 ? `rounded-t` : ``} ${
                                  index === 3
                                    ? `rounded-b`
                                    : `border-b-2 border-gray-200`
                                } bg-gray-100 hover:bg-gray-300 py-2 px-4 block whitespace-no-wrap`}
                                key={action.name}
                                onClick={_e =>
                                  onActionClicked(action.type, key)
                                }>
                                {action.name}
                              </li>
                            ))}
                      </ul>
                    </div>
                  </div>
                  {key.username ? (
                    <h1 className="text-xl text-gray-700 font-semibold mt-4">
                      {key.username}
                    </h1>
                  ) : (
                    <button
                      className="bg-blue-200 hover:bg-blue-300 text-blue-800 hover:text-blue-900 text-xs w-32 rounded-md p-2 mt-4 focus:outline-none"
                      onClick={() => onActionClicked('ADD_USERNAME', key)}>
                      Add username
                    </button>
                  )}

                  <button
                    className="bg-red-200 hover:bg-red-300 text-red-800 hover:text-red-900 text-xs rounded-md px-2 py-1 mt-4 focus:outline-none"
                    onClick={() => onActionClicked('ADD_LABEL', key)}>
                    {key.label ? key.label : 'Add label'}
                  </button>

                  <div className="absolute bottom-0 w-full">
                    {key.mode === 'MULTI' ? (
                      <button
                        className="bg-gray-300 hover:bg-gray-400 w-full h-12 text-gray-700 hover:text-gray-800 text-sm rounded-b-lg rounded-t-none focus:outline-none"
                        onClick={() => onActionClicked('UPDATE_REMOTE', key)}>
                        Update Remote
                      </button>
                    ) : (
                      <button
                        className="bg-gray-300 hover:bg-gray-400 w-full h-12 text-gray-700 hover:text-gray-800 text-sm rounded-b-lg rounded-t-none focus:outline-none"
                        onClick={() => onActionClicked('CLONE_REPO', key)}>
                        Clone Repo
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div
                className="w-48 h-48 flex my-4 flex-row justify-center items-center rounded-lg border-gray-500 border-2 border-dashed hover:border-blue-500 hover:bg-gray-200 cursor-pointer"
                onClick={() => onNewSshKeyClicked(provider)}>
                <PlusIcon className="text-gray-700 w-8 h-8 font-semibold" />
                <h1 className="ml-2 text-xl text-gray-700">New SSH key</h1>
              </div>
            )}
          </div>
        ) : null}
      </div>
    );
  });
  g;
};

export default ProviderAccordion;

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

const singleModeActions = [
  {
    name: 'Clone Repo',
    type: 'CLONE_REPO',
  },
  {
    name: 'Delete Key',
    type: 'DELETE_KEY',
  },
];

const multiModeActions = [
  {
    name: 'Clone Repo',
    type: 'CLONE_REPO',
  },
  {
    name: 'Update Remote',
    type: 'UPDATE_REMOTE',
  },
  {
    name: 'Delete Key',
    type: 'DELETE_KEY',
  },
];

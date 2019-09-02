import { useReducer, useState, useEffect } from 'react';

// reducer
import addKeyReducer from '../reducers/addKeyReducer';

// api imports
import { addKeysToGithubAccount, addKeysToGitlabAccount } from '../service/api';

// lib imports
import { providers } from '../../lib/config';

export default function useAddKeysToAccount(selectedProvider) {
  const [state, dispatch] = useReducer(addKeyReducer, {
    askingPermission: false,
    askingPermissionSuccess: false,
    askingPermissionError: false,
    addingKeys: false,
    addingKeysSuccess: false,
    addingKeysError: false,
  });

  const [userData, setUserData] = useState({
    publicKeyContent: null,
    token: null,
    title: null,
  });

  const { publicKeyContent, title, token } = userData;

  useEffect(() => {
    async function addKeysToAcccount() {
      try {
        let result;
        if (selectedProvider === providers.GITHUB) {
          result = await addKeysToGithubAccount(
            title ? title : 'ssh key added from ssh-git app',
            publicKeyContent.toString().trim(),
            token
          );
        } else if (selectedProvider === providers.GITLAB) {
          result = await addKeysToGitlabAccount(
            title ? title : 'ssh key added from ssh-git app',
            publicKeyContent.toString().trim(),
            token
          );
        }
        if (result) {
          dispatch({ type: 'ADD_KEYS_SUCCESS' });
        }
      } catch (error) {
        console.error('Error adding keys to account : ', error);
        dispatch({ type: 'ADD_KEYS_ERROR' });
      }
    }

    if (state.addingKeys && token) {
      addKeysToAcccount();
    }
  }, [state.addingKeys, token]);

  return [state, dispatch, setUserData];
}

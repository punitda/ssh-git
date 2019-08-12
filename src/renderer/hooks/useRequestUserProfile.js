import { useReducer, useEffect } from 'react';

import { providers } from '../../lib/config';
import {
  requestGithubUserProfile,
  requestBitbucketUserProfile,
  requestGitlabUserProfile,
} from '../service/api';

function fetchReducer(state, action) {
  switch (action.type) {
    case 'FETCH_INIT':
      return { ...state, isLoading: true, isError: false };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        data: action.payload,
        isError: false,
      };
    case 'FETCH_ERROR':
      return { ...state, isLoading: false, isError: true };
    default:
      throw new Error(`Invalid action.type: ${action.type}`);
  }
}

export function useRequestUserProfile(selectedProvider, token) {
  const [state, dispatch] = useReducer(fetchReducer, {
    isLoading: false,
    isError: false,
    data: null,
  });

  useEffect(() => {
    let didCancel = false;

    async function fetchUserProfile() {
      let profile;
      dispatch({ type: 'FETCH_INIT' });
      try {
        switch (selectedProvider) {
          case providers.GITHUB:
            profile = await requestGithubUserProfile(token);
            if (!didCancel) {
              dispatch({
                type: 'FETCH_SUCCESS',
                payload: {
                  email: profile.email,
                  username: profile.login,
                  avatar_url: profile.avatar_url,
                },
              });
            }
            break;
          case providers.BITBUCKET:
            profile = await requestBitbucketUserProfile(token);
            if (!didCancel) {
              dispatch({
                type: 'FETCH_SUCCESS',
                payload: {
                  email: profile.email,
                  username: profile.username,
                  avatar_url: profile.avatar_url,
                },
              });
            }
            break;
          case providers.GITLAB:
            profile = await requestGitlabUserProfile(token);
            if (!didCancel) {
              dispatch({
                type: 'FETCH_SUCCESS',
                payload: {
                  email: profile.email,
                  username: profile.username,
                  avatar_url: profile.avatar_url,
                },
              });
            }
            break;
          default:
            throw new Error(`Unsupported Provider: ${selectedProvider}`);
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: 'FETCH_FAILURE' });
        }
      }
    }

    fetchUserProfile();

    return () => {
      didCancel = true;
    };
  }, [selectedProvider, token]);

  return [state];
}

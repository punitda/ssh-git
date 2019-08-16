import React, { useContext } from 'react';

import { ClientStateContext } from '../../Context';
import { useRequestUserProfile } from '../../hooks/useRequestUserProfile';

import PropagateLoader from 'react-spinners/PropagateLoader';
import githublogo from '../../../assets/img/github_logo.png';

const UserProfile = ({ onNext }) => {
  const clientStateContext = useContext(ClientStateContext);
  const {
    token = null,
    selectedProvider = null,
  } = clientStateContext.authState;

  const [{ data, isLoading, isError }] = useRequestUserProfile(
    selectedProvider,
    token
  );

  return (
    <>
      <div className="w-64 h-64 p-6 mt-16 bg-gray-100 flex flex-col justify-center items-center rounded-lg mx-auto">
        <PropagateLoader
          loading={isLoading}
          size={16}
          sizeUnit={'px'}
          color={'#4299e1'}
        />
        {isError && (
          <p className="text-center text-red-600 ">
            Something went wrong. Please try again.
          </p>
        )}
        {data ? (
          <>
            <img
              className="h-24 w-24 rounded-full border-2 border-blue-500 shadow-lg mx-auto mb-4"
              src={data.avatar_url ? data.avatar_url : githublogo}
            />
            <div className="text-center">
              <h2 className="text-2xl text-gray-600">{data.username}</h2>
              <div className="text-blue-500 text-xl ">{data.email}</div>
            </div>
          </>
        ) : null}
      </div>
      <div className="text-right mr-16 mt-8">
        <button
          onClick={_e => onNext('oauth/generate')}
          className={
            isLoading
              ? styles.disabledNextStepButton
              : styles.enabledNextStepButton
          }>
          Next
        </button>
      </div>
    </>
  );
};

export default UserProfile;

const styles = {
  disabledNextStepButton: `px-6 py-2 text-gray-100 text-xl font-bold rounded bg-blue-300`,
  enabledNextStepButton: `px-6 py-2 text-gray-100 text-xl font-bold rounded bg-blue-500 hover:bg-blue-400 focus:bg-blue-600`,
};

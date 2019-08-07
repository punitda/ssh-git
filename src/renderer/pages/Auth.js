import React, { useContext } from 'react';

import { ClientStateContext } from '../Context';
import { useRequestUserProfile } from '../hooks/useRequestUserProfile';

const Auth = () => {
  const clientStateContext = useContext(ClientStateContext);
  const {
    token = null,
    selectedProvider = null,
  } = clientStateContext.authState;

  const [{ data, isLoading, isError }] = useRequestUserProfile(
    selectedProvider,
    token
  );

  if (isLoading) {
    return (
      <h1 className="flex flex-col items-center justify-center">Loading...</h1>
    );
  }

  if (isError) {
    return (
      <h1 className="flex flex-col items-center justify-center">
        Something went wrong. Please try again.
      </h1>
    );
  }

  if (data) {
    const { username, email } = data;
    return (
      <div className="flex flex-col items-center justify-center">
        <h1>User Name : {username}</h1>
        <h1>Email : {email}</h1>
      </div>
    );
  } else {
    return (
      <div>
        <h1>Profile not found.</h1>
      </div>
    );
  }
};

export default Auth;

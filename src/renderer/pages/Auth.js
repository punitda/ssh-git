import React from 'react';
import { source } from '../App';

const Auth = () => {
  const { code = null, state = null, token = null } = source.history.state;
  return (
    <div>
      <h1>Code - {code}</h1>
      <h2>State - {state}</h2>
      <h3>Token - {token}</h3>
    </div>
  );
};

export default Auth;

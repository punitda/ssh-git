import React from 'react';
import { source } from '../App';

const Auth = props => {
  const { code, state } = source.history.state;
  return (
    <div>
      <h1>Code - {code}</h1>
      <h2>State - {state}</h2>
    </div>
  );
};

export default Auth;

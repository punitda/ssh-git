import { createContext } from 'react';

export const AuthStateContext = createContext([
  {
    code: '',
    state: '',
    token: '',
    selectedProvider: '',
    email: '',
    username: '',
  },
  () => {},
]);

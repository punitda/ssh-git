import { createContext } from 'react';

export const ClientStateContext = createContext({
  authState: {
    code: '',
    state: '',
    token: '',
    selectedProvider: '',
    email: '',
    username: '',
  },
  setAuthState: () => {},
});

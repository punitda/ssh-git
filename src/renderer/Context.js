import { createContext } from 'react';

export const ClientStateContext = createContext({
  authState: { state: '', token: '', selectedProvider: '' },
  setAuthState: () => {},
});

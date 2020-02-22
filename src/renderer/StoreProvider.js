import React from 'react';
import store from './store';

const StoreContext = React.createContext(null);
export const StoreProvider = ({ children }) => (
  <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
);

export const useStore = () => React.useContext(StoreContext);

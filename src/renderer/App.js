import React from 'react';
import {
  Router,
  createMemorySource,
  createHistory,
  LocationProvider,
} from '@reach/router';

import Home from './pages/Home';
import Auth from './pages/Auth';
import { ClientStateContext } from './Context';

const source = createMemorySource('/');
export const history = createHistory(source);

class App extends React.Component {
  setAuthState = authState => {
    this.setState(prevState => ({
      authState: { ...prevState.authState, ...authState },
    }));
  };

  state = {
    authState: { state: '', token: '', selectedProvider: '' },
    setAuthState: this.setAuthState,
  };

  render() {
    return (
      <ClientStateContext.Provider value={this.state}>
        <LocationProvider history={history}>
          <Router>
            <Home path="/" />
            <Auth path="/oauth" />
          </Router>
        </LocationProvider>
      </ClientStateContext.Provider>
    );
  }
}
export default App;

import React from 'react';
import {
  Router,
  createMemorySource,
  createHistory,
  LocationProvider,
} from '@reach/router';

import Home from './pages/Home';
import SSHSetup from './pages/SSHSetup';
import UpdateRemote from './pages/UpdateRemote';

import { ClientStateContext } from './Context';

const source = createMemorySource('/');
export const history = createHistory(source);

import { oauth } from '../lib/config';

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

  componentDidMount() {
    window.ipcRenderer.send('github-config', oauth.github);
  }

  render() {
    return (
      <ClientStateContext.Provider value={this.state}>
        <LocationProvider history={history}>
          <Router>
            <Home path="/" />
            <SSHSetup path="/oauth" />
            <UpdateRemote path="/updateRemote" />
          </Router>
        </LocationProvider>
      </ClientStateContext.Provider>
    );
  }
}
export default App;

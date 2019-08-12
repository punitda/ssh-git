import React from 'react';
import {
  Router,
  createMemorySource,
  createHistory,
  LocationProvider,
} from '@reach/router';

//Pages
import Home from './pages/Home';
import SSHSetup from './pages/sshsetup/SSHSetup';
import UpdateRemote from './pages/updateremote/UpdateRemote';

//Global app wide context to store user state.
import { ClientStateContext } from './Context';

//In-Memory Router
const source = createMemorySource('/');
export const history = createHistory(source);

//Github token workaround.
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

  navigateTo(path) {
    history.navigate(path);
  }

  render() {
    return (
      <ClientStateContext.Provider value={this.state}>
        <LocationProvider history={history}>
          <Router>
            <Home path="/" navigateTo={this.navigateTo} />
            <SSHSetup path="/oauth/*" />
            <UpdateRemote path="/updateRemote" />
          </Router>
        </LocationProvider>
      </ClientStateContext.Provider>
    );
  }
}
export default App;

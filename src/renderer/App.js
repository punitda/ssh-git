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

export const source = createMemorySource('/');
const history = createHistory(source);

class App extends React.Component {
  setAuthState = authState => {
    this.setState(prevState => ({ ...prevState, authState }));
  };

  state = {
    authState: { state: '', token: '', selectedProvider: '' },
    setAuthState: this.setAuthState,
  };

  authEventListener = (_event, state) => {
    history.navigate('/oauth', { state, replace: true });
  };

  componentDidMount() {
    window.ipcRenderer.on('start-auth', this.authEventListener);
  }

  componentWillUnmount() {
    window.ipcRenderer.removeListener('start-auth', this.authEventListener);
  }

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

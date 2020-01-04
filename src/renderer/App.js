import React, { useState, useEffect } from 'react';
import {
  Router,
  createMemorySource,
  createHistory,
  LocationProvider,
} from '@reach/router';

//Pages
import Home from './pages/Home';
import SSHSetup from './pages/sshsetup/SSHSetup';
import UpdateRemoteDirect from './pages/updateremote/UpdateRemoteDirect';

//Global app wide context to store user state.
import { AuthStateContext } from './Context';
import { trackScreen } from './analytics';

//In-Memory Router
const source = createMemorySource('/');
export const history = createHistory(source);

history.listen(({ location }) => {
  if (location.pathname === '' || location.pathname === '/') {
    trackScreen('main-screen');
  } else {
    trackScreen(location.pathname);
  }
});

//Github token workaround.
import { oauth } from '../lib/config';

function App() {
  const state = useState({
    authState: { state: '', token: '', selectedProvider: '' },
  });

  useEffect(() => {
    async function sendGithubConfig() {
      const _result = await window.ipc.callMain('github-config', oauth.github);
    }
    sendGithubConfig();
  }, []);

  function navigateTo(path) {
    history.navigate(path);
  }

  return (
    <AuthStateContext.Provider value={state}>
      <LocationProvider history={history}>
        <Router>
          <Home path="/" navigateTo={navigateTo} />
          <SSHSetup path="/oauth/*" />
          <UpdateRemoteDirect path="/updateRemoteDirect" />
        </Router>
      </LocationProvider>
    </AuthStateContext.Provider>
  );
}
export default App;

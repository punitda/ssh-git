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
import UpdateRemoteDirect from './pages/updateremote/UpdateRemoteDirect';

//Global app wide context to store user state.
import { AuthStateContext } from './Context';
import { trackScreen } from './analytics';

import { observer } from 'mobx-react-lite';
import { useStore } from './StoreProvider';

import { onSnapshot } from 'mobx-state-tree';

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

const App = observer(() => {
  const { keyStore } = useStore();

  React.useEffect(() => {
    async function importStore() {
      const storeSnapshot = await window.ipc.callMain('import-store');
      keyStore.addKeys(storeSnapshot);
    }

    importStore();
  }, []);

  React.useEffect(() => {
    const dispose = onSnapshot(keyStore, snapshot => {
      window.ipc.callMain('export-store', { snapshot });
    });
    return () => dispose();
  }, []);

  const state = React.useState({
    authState: {
      state: '',
      token: '',
      selectedProvider: '',
    },
  });

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
});

export default App;

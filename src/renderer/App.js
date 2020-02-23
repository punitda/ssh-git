import React from 'react';
import {
  Router,
  createMemorySource,
  createHistory,
  LocationProvider,
} from '@reach/router';

//Pages
import Home from './pages/Home';
import Landing from './pages/Landing';
import SSHSetup from './pages/sshsetup/SSHSetup';

// MST
import { observer } from 'mobx-react-lite';
import { useStore } from './StoreProvider';
import { onSnapshot } from 'mobx-state-tree';

// Analytics
import { trackScreen } from './analytics';

//In-Memory Router
function createInMemoryRouter() {
  let source;
  if (
    window.localStorage &&
    !window.localStorage.getItem('isLandingPageShown')
  ) {
    window.localStorage.setItem('isLandingPageShown', 'true');
    source = createMemorySource('/landing');
  } else {
    source = createMemorySource('/');
  }

  return createHistory(source);
}

const history = createInMemoryRouter();

// Listen to location changes for logging tracking screens
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

  return (
    <LocationProvider history={history}>
      <Router>
        <Landing path="/landing" />
        <Home path="/" />
        <SSHSetup path="/oauth/*" />
      </Router>
    </LocationProvider>
  );
});

export default App;

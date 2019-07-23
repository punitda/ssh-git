import React from 'react';
import {
  Router,
  createMemorySource,
  createHistory,
  LocationProvider,
} from '@reach/router';

import Home from './pages/Home';
import Auth from './pages/Auth';

export const source = createMemorySource('/');
const history = createHistory(source);

function App() {
  return (
    <LocationProvider history={history}>
      <Router>
        <Home path="/" />
        <Auth path="/oauth" />
      </Router>
    </LocationProvider>
  );
}
export default App;

window.ipcRenderer.on('auth-code', (_event, state) => {
  history.navigate('/oauth', { state, replace: true });
});

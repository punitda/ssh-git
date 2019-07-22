import React from 'react';
import {
  Router,
  createMemorySource,
  createHistory,
  LocationProvider,
} from '@reach/router';

import Home from './pages/Home';
import Auth from './pages/Auth';

let source = createMemorySource('/');
let history = createHistory(source);

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

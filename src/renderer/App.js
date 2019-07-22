import React from 'react';
import { Router } from '@reach/router';

import Home from './pages/Home';
import Auth from './pages/Auth';

const App = () => {
  return (
    <div>
      <Router>
        <Home path="/" />
        <Auth path="/oauth" />
      </Router>
    </div>
  );
};
export default App;

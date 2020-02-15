import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import { StoreProvider } from './StoreProvider';

const Root = () => (
  <StoreProvider>
    <App />
  </StoreProvider>
);

ReactDOM.render(<Root />, document.getElementById('root'));

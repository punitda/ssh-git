import React from 'react';

import Toolbar from '../../components/Toolbar';
import { history } from '../../App';

export default function UpdateRemote() {
  function goBackToHomeScreen() {
    history.navigate('');
  }

  return (
    <div className="bg-gray-300 h-screen">
      <Toolbar onBackPressed={goBackToHomeScreen} title="Update Remote" />
    </div>
  );
}

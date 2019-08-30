import React from 'react';

import Toolbar from '../../components/Toolbar';
import { history } from '../../App';

export default function UpdateRemote({ isDirect = false }) {
  function goBackToHomeScreen() {
    history.navigate('');
  }

  if (isDirect) {
    return (
      <div className="bg-gray-300 h-screen">
        <Toolbar onBackPressed={goBackToHomeScreen} title="Update Remote" />
      </div>
    );
  } else {
    return <h1 className="text-center text-2xl">This is fine</h1>;
  }
}

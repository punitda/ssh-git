//Libs
import React from 'react';
import { Router } from '@reach/router';

//Components
import Toolbar from '../components/Toolbar';
import StepsNavBar from '../components/StepsNavBar';

//Pages
import ConnectAccount from '../pages/ConnectAccount';
import GenerateKeys from '../pages/GenerateKeys';

//Internal
import { history } from '../App';

const steps = ['Connect', 'Generate', 'Add', 'Update'];

export default function SSHSetup() {
  function goBackToHomeScreen() {
    history.navigate('');
  }

  return (
    <div className="bg-gray-300 h-screen">
      <Toolbar onBackPressed={goBackToHomeScreen} title="Setup SSH" />
      <StepsNavBar steps={steps} activeIndex={0} />
      <Router>
        <ConnectAccount path="/" />
        <GenerateKeys path="/generate" />
      </Router>
    </div>
  );
}

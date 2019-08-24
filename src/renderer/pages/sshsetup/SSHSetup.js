//Libs
import React, { useState } from 'react';
import { Router } from '@reach/router';

//Components
import Toolbar from '../../components/Toolbar';
import StepsNavBar from '../../components/StepsNavBar';

//Pages
import ConnectAccount from './ConnectAccount';
import GenerateKeys from './GenerateKeys';
import AddKeys from './AddKeys';

//Internal
import { history } from '../../App';

const steps = ['Connect', 'Generate', 'Add', 'Update'];

export default function SSHSetup() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  function goBackToHomeScreen() {
    history.navigate('');
  }

  function onNext(path) {
    switch (path) {
      case 'oauth/success':
        setActiveStepIndex(0);
        break;
      case 'oauth/generate':
        setActiveStepIndex(1);
        break;
      case 'oauth/addKeys':
        setActiveStepIndex(2);
        break;
      default:
        break;
    }
    history.navigate(path);
  }

  return (
    <div className="bg-gray-300 h-screen">
      <Toolbar onBackPressed={goBackToHomeScreen} title="Setup SSH" />
      <StepsNavBar steps={steps} activeIndex={activeStepIndex} />
      <Router>
        <ConnectAccount path="/" onNext={onNext} />
        <GenerateKeys path="/generate" onNext={onNext} />
        <AddKeys path="/addKeys" onNext={onNext} />
      </Router>
    </div>
  );
}

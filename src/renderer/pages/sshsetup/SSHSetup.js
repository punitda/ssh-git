//Libs
import React, { useState } from 'react';
import { Router } from '@reach/router';

//Components
import Toolbar from '../../components/Toolbar';
import StepsNavBar from '../../components/StepsNavBar';

//Pages
import ConnectAccount from './ConnectAccount';
import GenerateKey from './GenerateKey';
import AddKey from './AddKey';
import CloneRepo from './CloneRepo';

//Internal
import { history } from '../../App';

const steps = ['Connect', 'Generate', 'Add', 'Clone'];

export default function SSHSetup() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  function goBackToHomeScreen() {
    history.navigate('/');
  }

  function onNext(path) {
    switch (path) {
      case 'oauth/success':
      case 'oauth/connect':
        setActiveStepIndex(0);
        break;
      case 'oauth/generate':
        setActiveStepIndex(1);
        break;
      case 'oauth/add':
        setActiveStepIndex(2);
        break;
      case 'oauth/clone':
        setActiveStepIndex(3);
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
        <ConnectAccount path="/connect" onNext={onNext} />
        <GenerateKey path="/generate" onNext={onNext} />
        <AddKey path="/add" onNext={onNext} />
        <CloneRepo path="/clone" />
      </Router>
    </div>
  );
}

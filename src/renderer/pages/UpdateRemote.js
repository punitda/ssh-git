import React from 'react';

import LeftArrowSvg from '../../../public/assets/img/left_arrow.svg';
import { history } from '../App';

export default function UpdateRemote() {
  function goBackToHomeScreen() {
    history.navigate('');
  }

  return (
    <div className="bg-gray-300 h-screen">
      <div className="bg-gray-700 p-3 flex items-center">
        <LeftArrowSvg onClick={goBackToHomeScreen} />
        <span className="text-gray-100 font-semibold text-lg ml-4">
          Update Remote
        </span>
      </div>
    </div>
  );
}

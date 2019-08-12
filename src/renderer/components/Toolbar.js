import React from 'react';
import LeftArrowSvg from '../../assets/img/left_arrow.svg';

export default function Toolbar({ onBackPressed, title }) {
  return (
    <div className="bg-gray-700 p-3 flex items-center">
      <LeftArrowSvg
        onClick={onBackPressed}
        className="hover:bg-gray-600 hover:border-gray-600 rounded-lg"
      />
      <span className="text-gray-100 font-semibold text-xl ml-4">{title}</span>
    </div>
  );
}

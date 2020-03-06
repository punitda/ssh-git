import React from 'react';

export default function ActionToolbar({ logo, title, onPrimaryAction }) {
  return (
    <div className="bg-gray-800 py-3 px-4 flex flex-row justify-between items-center">
      <div>
        {logo ? <img src={logo} className="w-8 h-8 inline" /> : null}
        <span className="text-gray-100 font-semibold text-xl ml-2">
          {title}
        </span>
      </div>

      <button
        className="primary-btn-success hover:bg-green-700 text-base px-4 py-2 focus:outline-none"
        onClick={onPrimaryAction}>
        New SSH key
      </button>
    </div>
  );
}

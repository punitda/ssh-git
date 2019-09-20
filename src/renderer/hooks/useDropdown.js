import React, { useState } from 'react';

function useDropdown(label, defaultState, options) {
  const [state, setState] = useState(defaultState);
  const id = `use-dropdown-${label}`;

  const Dropdown = () => (
    <>
      <label
        htmlFor={id}
        className="text-gray-800 block text-left text-base mt-6 font-semibold">
        {label}
      </label>
      <select
        id={id}
        value={state}
        className="text-gray-800 text-base bg-gray-100 mt-2 h-12 rounded border-2 w-full"
        onChange={e => setState(e.target.value)}
        onBlur={e => setState(e.target.value)}
        disabled={options.length === 0}>
        {options && (
          <option disabled value="">
            {label}
          </option>
        )}
        {options &&
          options.map(item => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
      </select>
    </>
  );

  return [state, setState, Dropdown];
}

export default useDropdown;

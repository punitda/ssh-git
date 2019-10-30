import React from 'react';

const Switch = ({ isOn, handleToggle, activeColor = '#38a169' }) => {
  return (
    <>
      <input
        checked={isOn}
        onChange={handleToggle}
        className="react-switch-checkbox"
        id="react-switch-new"
        type="checkbox"
      />
      <label
        style={{ background: isOn && activeColor }}
        className="react-switch-label"
        htmlFor="react-switch-new">
        <span className="react-switch-button" />
      </label>
    </>
  );
};

export default Switch;

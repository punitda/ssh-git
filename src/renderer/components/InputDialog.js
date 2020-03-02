import React from 'react';

import { DialogOverlay, DialogContent } from '@reach/dialog';

const InputDialog = ({
  title,
  placeholder,
  initialValue = '',
  inputExample = '',
  onDismiss,
  onInputAdded,
}) => {
  const [inputValue, setInputValue] = React.useState(initialValue);

  return (
    <DialogOverlay onDismiss={onDismiss} className="c-modal-cover">
      <DialogContent aria-labelledby={title}>
        <div className="c-modal">
          <button
            className="c-modal__close focus:outline-none"
            aria-labelledby="close-modal"
            onClick={onDismiss}>
            <span className="u-hide-visually" id="close-modal">
              Close
            </span>
            <svg className="c-modal__close-icon" viewBox="0 0 40 40">
              <path d="M 10,10 L 30,30 M 30,10 L 10,30"></path>
            </svg>
          </button>
          <h1 className="mt-4 text-2xl font-semibold" id={title}>
            {title}
          </h1>
          <div className="relative mt-4">
            <input
              type="text"
              className="text-gray-800 text-base bg-gray-100 px-4 py-2 rounded border-2 w-full focus:outline-none"
              placeholder={placeholder}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
            />
            <button
              className="primary-btn px-4 text-center absolute right-0 top-0 bottom-0 rounded-r rounded-l-none focus:outline-none"
              disabled={!inputValue}
              onClick={() => onInputAdded(inputValue)}>
              Add
            </button>
          </div>
          {inputExample ? (
            <span className="inline-block text-gray-600 text-sm mt-2">
              {inputExample}
            </span>
          ) : null}
        </div>
      </DialogContent>
    </DialogOverlay>
  );
};

export default InputDialog;

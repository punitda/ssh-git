import React from 'react';

export default function useTimeout() {
  const timeoutIds = React.useRef([]);

  React.useEffect(() => {
    return () =>
      timeoutIds.current.forEach(timeoutId => clearTimeout(timeoutId));
  }, []);

  function addTimeout(callback, delay) {
    const timeoutId = setTimeout(callback, delay);
    timeoutIds.current.push(timeoutId);
  }

  return addTimeout;
}

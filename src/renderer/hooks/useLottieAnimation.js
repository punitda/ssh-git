import React from 'react';
import lottie from 'lottie-web';

export default function useLottieAnimation(animationData, elementRef) {
  const ref = React.useRef(null);

  if (ref.current === null && elementRef.current !== null) {
    ref.current = lottie.loadAnimation({
      container: elementRef.current,
      renderer: 'svg',
      loop: false,
      autoplay: false,
      animationData,
    });
  }

  return ref.current;
}

import React from 'react';
import lottie from 'lottie-web';

export default function useLottieAnimation(animationData, elementRef) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    return () => lottie.destroy();
  }, []);

  if (ref.current === null && elementRef.current !== null) {
    ref.current = lottie.loadAnimation({
      container: elementRef.current,
      renderer: 'svg',
      loop: false,
      autoplay: false,
      animationData,
    });
  }

  const stopAnimation = React.useCallback(() => {
    if (ref.current !== null) lottie.stop();
  }, [elementRef]);

  return [ref.current, stopAnimation];
}

import { useEffect, useRef, useState } from 'react';

const useIsTruncated = (text: string, maxWidth: number) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const checkTruncation = () => {
      const element = ref.current;
      if (element) {
        // Check if content is wider than container
        setIsTruncated(element.scrollWidth > maxWidth);
      }
    };

    checkTruncation();
    // Re-check on window resize
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [text, maxWidth]);

  return { ref, isTruncated };
};

export default useIsTruncated;

'use client';

import * as React from 'react';

export function useClickOutside<T extends HTMLElement>(
  handler: () => void,
): React.RefObject<T | null> {
  const ref = React.useRef<T | null>(null);

  React.useEffect(() => {
    const onDown = (e: MouseEvent): void => {
      const el = ref.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) handler();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [handler]);

  return ref;
}

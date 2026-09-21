import { useEffect, type RefObject } from 'react';

export function useClickOutside<T extends HTMLElement>(
ref: RefObject<T>,
handler: () => void,
enabled = true)
: void {
  useEffect(() => {
    if (!enabled) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const element = ref.current;
      if (!element || element.contains(event.target as Node)) return;
      handler();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handler();
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [ref, handler, enabled]);
}
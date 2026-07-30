import {useEffect, type RefObject} from 'react';

/**
 * Closes a dropdown when Escape is pressed or (optionally) when a mousedown
 * occurs outside the provided wrapper element.
 *
 * Accepts React's `setOpen` dispatch directly — it's stable across renders,
 * so the effect only re-registers listeners when `open` actually changes.
 */
export function useDropdownClose(
  open: boolean,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>,
  wrapperRef?: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef?.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    if (wrapperRef) document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (wrapperRef) document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, setOpen, wrapperRef]);
}

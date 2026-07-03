import React, {useEffect, useRef, useState, type ComponentProps} from 'react';
import {createPortal} from 'react-dom';
import clsx from 'clsx';
import styles from './Img.module.css';

/**
 * Doc image with a rounded skeleton/loading area and a smooth blur-up reveal
 * (low-res blur → sharp), plus click-to-zoom into a full-screen lightbox
 * (click anywhere or press Esc to close).
 */
export default function MDXImg(props: ComponentProps<'img'>): JSX.Element {
  const {className, ...rest} = props;
  const [loaded, setLoaded] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // Cached images can finish loading before React wires up onLoad.
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, []);

  // While zoomed: Esc closes and the page scroll is locked.
  useEffect(() => {
    if (!zoomed) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomed(false);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [zoomed]);

  return (
    <span className={clsx(styles.frame, loaded && styles.loaded)}>
      <img
        ref={ref}
        loading="lazy"
        decoding="async"
        {...rest}
        className={clsx(styles.img, loaded && styles.zoomable, className)}
        onLoad={() => setLoaded(true)}
        onClick={loaded ? () => setZoomed(true) : undefined}
      />
      {zoomed && typeof document !== 'undefined' &&
        createPortal(
          <div
            className={styles.lightbox}
            role="dialog"
            aria-modal="true"
            aria-label={typeof rest.alt === 'string' ? rest.alt : 'Image preview'}
            onClick={() => setZoomed(false)}>
            <img
              src={rest.src}
              alt={typeof rest.alt === 'string' ? rest.alt : ''}
              className={styles.lightboxImg}
            />
            <button
              type="button"
              className={styles.lightboxClose}
              aria-label="Close image preview"
              onClick={() => setZoomed(false)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>,
          document.body,
        )}
    </span>
  );
}

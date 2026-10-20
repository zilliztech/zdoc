import React, {useEffect, useRef, useState, type ComponentProps} from 'react';
import {createPortal} from 'react-dom';
import clsx from 'clsx';
import {useDocsUiText} from '../../i18n/uiText';
import styles from './Img.module.css';

/**
 * Doc image with a rounded skeleton/loading area and a smooth blur-up reveal
 * (low-res blur → sharp), plus click-to-zoom into a full-screen lightbox
 * (click anywhere or press Esc to close).
 */
export default function MDXImg(props: ComponentProps<'img'>): JSX.Element {
  const text = useDocsUiText();
  const {className, ...rest} = props;
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // Cached images can finish loading before React wires up onLoad — and after a
  // hydration-mismatch remount React's listeners can attach too late as well, so
  // back the onLoad/onError props with native listeners on the same element.
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (el.complete) {
      if (el.naturalWidth > 0) setLoaded(true);
      else if (el.currentSrc || el.getAttribute('src')) setFailed(true);
    }
    const onNativeLoad = () => setLoaded(true);
    const onNativeError = () => setFailed(true);
    el.addEventListener('load', onNativeLoad);
    el.addEventListener('error', onNativeError);
    return () => {
      el.removeEventListener('load', onNativeLoad);
      el.removeEventListener('error', onNativeError);
    };
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
    <span className={clsx(styles.frame, loaded && styles.loaded, failed && !loaded && styles.error)}>
      <img
        ref={ref}
        loading="lazy"
        decoding="async"
        {...rest}
        className={clsx(styles.img, loaded && styles.zoomable, className)}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        onClick={loaded ? () => setZoomed(true) : undefined}
      />
      {failed && !loaded && (
        <span className={styles.errorLabel}>{text.image.loadFailed}</span>
      )}
      {zoomed && typeof document !== 'undefined' &&
        createPortal(
          <div
            className={styles.lightbox}
            role="dialog"
            aria-modal="true"
            aria-label={typeof rest.alt === 'string' ? rest.alt : text.image.preview}
            onClick={() => setZoomed(false)}>
            <img
              src={rest.src}
              alt={typeof rest.alt === 'string' ? rest.alt : ''}
              className={styles.lightboxImg}
            />
            <button
              type="button"
              className={styles.lightboxClose}
              aria-label={text.image.closePreview}
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

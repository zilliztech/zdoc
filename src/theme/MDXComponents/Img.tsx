import React, {useEffect, useRef, useState, type ComponentProps} from 'react';
import clsx from 'clsx';
import styles from './Img.module.css';

/**
 * Doc image with a rounded skeleton/loading area and a smooth blur-up reveal
 * (low-res blur → sharp), instead of the default abrupt top-down paint.
 */
export default function MDXImg(props: ComponentProps<'img'>): JSX.Element {
  const {className, ...rest} = props;
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // Cached images can finish loading before React wires up onLoad.
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, []);

  return (
    <span className={clsx(styles.frame, loaded && styles.loaded)}>
      <img
        ref={ref}
        loading="lazy"
        decoding="async"
        {...rest}
        className={clsx(styles.img, className)}
        onLoad={() => setLoaded(true)}
      />
    </span>
  );
}

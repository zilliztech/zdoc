import React from 'react';
import styles from './styles.module.css';

export default function Hero ({ children }) {
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.subtract}>
          { children[0] }
          { children[1] }
        </div>
        <div className={styles.heroImg}>
          { children[2] }
        </div>
      </div>
    </div>
  )
}
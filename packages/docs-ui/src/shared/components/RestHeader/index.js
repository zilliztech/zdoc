import React from 'react';
import styles from './index.module.css';

const methodBadgeClass = {
  GET: styles.badgeGet,
  POST: styles.badgePost,
  PUT: styles.badgePut,
  DELETE: styles.badgeDelete,
  PATCH: styles.badgePatch,
};

export default function RestHeader(props) {
  const method = props.method.toUpperCase();

  return (
    <div className={styles.container}>
      <span className={`${styles.badge} ${methodBadgeClass[method] || ''}`}>
        {method}
      </span>
      <span className={styles.endpoint}>{props.endpoint}</span>
    </div>
  );
}

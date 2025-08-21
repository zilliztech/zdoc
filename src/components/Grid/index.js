import React from 'react';
import styles from './styles.module.css';

function GridColumn({ widthRatio, children }) {
  return (
    <div style={{ flex: `${widthRatio} 0 0` }}>
      {children}
    </div>
  );
}

export default function Grid({ columnSize, widthRatios, children }) {
  const columns = [];

  for (let i = 0; i < columnSize; i++) {
    const widthRatio = widthRatios.split(',')[i];
    columns.push(
      <GridColumn key={i} widthRatio={widthRatio}>
        {children[i]}
      </GridColumn>
    );
  }

  return (
    <div style={{ display: 'flex', width: '100%', marginTop: '40px' }}>
      {columns}
    </div>
  );
}
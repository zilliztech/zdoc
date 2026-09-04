import styles from './styles.module.css';

function GridColumn({ widthRatio, children }) {
  return (
    <div className={styles.column} style={{ flex: `${widthRatio} 0 0` }}>
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
    <div className={styles.grid}>
      {columns}
    </div>
  );
}

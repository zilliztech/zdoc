import React from 'react';
import styles from './styles.module.css';

export default function Procedures({ children, active }) {
    if (children.type !== 'ol') throw new Error('Procedures component must have ordered list as children');

    children = children.props.children.filter((child) => child !== '\n');
    const steps = children.map((child) => {
        const step = child.props.children.filter((step) => step !== '\n')
        const title = step[0].props.children;
        const description = step[1];

        return { title, description };
    })

    return (
        <div className={styles.procedure} style={{ display: active? 'block' : 'none' }}>
            {steps.map((step, index) => (
                <div key={index} className={styles.step}>
                    <div className={styles.stepNumber}>
                        <span>{index + 1}</span>
                        {index < steps.length - 1 && <div className={styles.connector}></div>}
                    </div>
                    <div className={styles.stepContent}>
                        <h3>{step.title}</h3>
                        {step.description}
                    </div>
                </div>
            ))}
        </div>
    );
}
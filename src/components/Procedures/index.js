import React from 'react';
import styles from './styles.module.css';

// True if a step's description contains an image / visual media (markdown images
// carry a `src` prop; supademo demos use a container class).
function hasMedia(node) {
    if (!node) return false;
    if (Array.isArray(node)) return node.some(hasMedia);
    if (typeof node !== 'object') return false;
    const p = node.props || {};
    if (node.type === 'img' || p.src != null || p.mdxType === 'img') return true;
    if (typeof p.className === 'string' && p.className.includes('supademo')) return true;
    return hasMedia(p.children);
}

export default function Procedures({ children, active = true }) {
    if (children.type !== 'ol') throw new Error('Procedures component must have ordered list as children');

    children = children.props.children.filter((child) => child !== '\n');
    const steps = children.map((child) => {
        const stepChildren = child.props.children.filter((step) => step !== '\n');

        // Extract title from the first paragraph element
        let title = '';
        let descriptionElements = [];
        let foundTitle = false;

        stepChildren.forEach((element) => {
            if (!foundTitle && element.type === 'p') {
                // First paragraph is the title
                title = element.props.children;
                foundTitle = true;
            } else {
                // Everything else is part of the description
                descriptionElements.push(element);
            }
        });

        return { title, description: descriptionElements };
    })

    return (
        <div className={styles.procedure} style={{ display: active? 'block' : 'none' }}>
            {steps.map((step, index) => (
                <div key={index} className={styles.step}>
                    <div className={styles.stepNumber}>
                        <span>{index + 1}</span>
                        {index < steps.length - 1 && hasMedia(step.description) && <div className={styles.connector}></div>}
                    </div>
                    <div className={styles.stepContent}>
                        <h3>{step.title}</h3>
                        {Array.isArray(step.description) ? step.description.map((desc, i) => <div key={i}>{desc}</div>) : step.description}
                    </div>
                </div>
            ))}
        </div>
    );
}
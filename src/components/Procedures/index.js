import React from 'react';
import styles from './styles.module.css';

// True if a step has any body content below its title (text, code, image, …).
// The connector line runs alongside that content down to the next step number.
function hasContent(description) {
    return Array.isArray(description) ? description.length > 0 : Boolean(description);
}

export default function Procedures({ children, active = true }) {
    children = React.Children.toArray(children).find((child) => React.isValidElement(child) && child.type === 'ol');
    if (!children) throw new Error('Procedures component must have ordered list as children');

    children = React.Children.toArray(children.props.children).filter((child) => React.isValidElement(child) && child.type === 'li');
    const steps = children.map((child) => {
        const stepChildren = React.Children.toArray(child.props.children);

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
                        {index < steps.length - 1 && hasContent(step.description) && <div className={styles.connector}></div>}
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

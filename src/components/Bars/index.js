import React from 'react';
import styles from './styles.module.css';

export default function Bars({ children }) {

    const plans = children[1].props.children.filter((child) => child !== '\n');

    return (
        <div className={styles.container}>
            <p className={styles.lead}>{ children[0] }</p>
            <ul className={styles.list}>
                { plans.map((plan, index) => { 
                    if (!plan.type.name || plan.type.name !== 'MDXLi') throw new Error('Invalid child type');

                    plan = plan.props.children.filter((child) => child !== '\n')[0]
                    if (plan.props.children instanceof String) {
                        var name = plan.props.children
                    } else {
                        let content = plan.props.children
                        if (content.type.name && content.type.name === 'MDXA') {
                            name = content.props.children
                            var href = content.props.href
                        }
                    }

                    if (href) {
                        return (
                            <li key={index} className={styles.item}>
                                <a href={href}>
                                    <i className={styles[`icon${name}`]}  />
                                    { name }
                                </a>
                            </li>                            
                        )
                    }

                    return (
                        <li key={index} className={styles.item}>
                            <i className={styles[`icon${name}`]}  />
                            { name }
                        </li>
                    )}
                )}
            </ul>
            <p className={styles.trail}>{ children[2] }</p>
        </div>
    )    
}
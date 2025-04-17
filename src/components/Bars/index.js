import React from 'react';
import styles from './styles.module.css';

export default function Bars({ children }) {
    if (!Array.isArray(children) || children.length === 0) {
        return null;
    }

    const plans = React.Children.toArray(children[1].props.children)
        .filter(child => typeof child !== 'string' || child.trim() !== '')
        .map(child => {
            if (!React.isValidElement(child)) return null;
            
            let firstChild = React.Children.toArray(child.props.children)
                .find(c => typeof c !== 'string' || c.trim() !== '');

            if (firstChild && React.isValidElement(firstChild) && firstChild.type === 'p') {
                firstChild = React.Children.toArray(firstChild.props.children)
                    .find(c => typeof c !== 'string' || c.trim() !== '');
            }
                
            if (!firstChild || !React.isValidElement(firstChild)) {
                return {
                    name: typeof firstChild === 'string' ? firstChild : '',
                    href: ''
                };
            }

            if (!firstChild.props) {
                return {
                    name: '',
                    href: ''
                };
            }

            const isLink = firstChild.props.href !== undefined;
            const nameValue = isLink
                ? (firstChild.props.children || '')
                : (typeof firstChild === 'string' ? firstChild : '');

            return {
                name: nameValue,
                href: isLink ? firstChild.props.href : ''
            };
        })
        .filter(Boolean);

    return (
        <div className={styles.container}>
            <p className={styles.lead}>{ children[0]?.props?.children || children[0] }</p>
            <ul className={styles.list}>
                { plans.map((plan, index) => { 
                    if (plan.href) {
                        return (
                            <li key={index} className={styles.item}>
                                <a href={plan.href}>
                                    <i className={styles[`icon${plan.name}`]}  />
                                    <p>{ plan.name }</p>
                                </a>
                            </li>                            
                        )
                    }

                    return (
                        <li key={index} className={styles.item}>
                            <i className={styles[`icon${plan.name}`]}  />
                            <p>{ plan.name }</p>
                        </li>
                    )}
                )}
            </ul>
            <p className={styles.trail}>{ children[2]?.props?.children || children[2] }</p>
        </div>
    )    
}
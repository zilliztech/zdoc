import React from 'react';
import styles from './styles.module.css';

export default function Cards({ children }) {
    if (!Array.isArray(children) || children.length === 0) {
        return null;
    }

    const items = React.Children.toArray(children[1].props.children)
        .filter(item => typeof item !== 'string' || item.trim() !== '')
        .map(item => {
            if (!React.isValidElement(item)) return null;

            let content = React.Children.toArray(item.props.children)
                .filter(c => typeof c !== 'string' || c.trim() !== '');

            let firstChild = content[0];
            let secondChild = content[1];

            if (firstChild && React.isValidElement(firstChild) && firstChild.type === 'p') {
                firstChild = React.Children.toArray(firstChild.props.children)
                    .find(c => typeof c !== 'string' || c.trim() !== '');
            }

            const isLink = firstChild?.props?.href !== undefined;
            const isPlainText = typeof secondChild?.props.children === 'string';

            let description = isPlainText ? secondChild.props.children : '';

            if (isLink) {
                let name = firstChild.props.children;
                let href = firstChild.props.href;
                let keyword = name.split(' ')[0].replace('.', '');
 
                return {
                    name,
                    href,
                    description,
                    className: `icon${keyword}`
                };
            }

            return {
                name: firstChild,
                description,
                className: `icon${String(firstChild).split(' ')[0].replace('.', '')}`
            };
        })
        .filter(Boolean);

    return (
        <div className={styles.container}>
            { children[0] }
            <div className={styles.items}>
                { items.map((item, index) => {
                    if (item.name === 'break') {
                        return <div key={index} className={styles.break}></div>
                    } else {
                        if (item.href) {
                            return (
                                <a key={index}
                                className={styles.item} href={item.href}>
                                    <span className={styles.iconContainer}>
                                        <i className={styles[item.className]}></i>
                                    </span>
                                    <h3>{item.name}</h3>
                                    <p>{item.description}</p>
                                </a>                                
                            )
                        } else {
                            return (
                                <div key={index}
                                    className={styles.item}>
                                    <span className={styles.iconContainer}>
                                        <i className={styles[item.className]}></i>
                                    </span>
                                    <h3>{item.name}</h3>
                                    <p>{item.description}</p>
                                </div>
                            )
                        }
                    }
                })}
            </div>
        </div>       
    )
}
import React from 'react';
import styles from './styles.module.css';

export default function Block({ children }) {
    if (!Array.isArray(children) || children.length === 0) {
        return null;
    }

    const items = React.Children.toArray(children[1].props.children)
        .filter(item => typeof item !== 'string' || item.trim() !== '')
        .map(item => {
            if (!React.isValidElement(item)) return null;

            let firstChild = React.Children.toArray(item.props.children)
                .find(c => typeof c !== 'string' || c.trim() !== '');

            if (firstChild && React.isValidElement(firstChild) && firstChild.type === 'p') {
                firstChild = React.Children.toArray(firstChild.props.children)
                    .find(c => typeof c !== 'string' || c.trim() !== '');
            }

            const isLink = firstChild?.props?.href !== undefined;

            if (isLink) {
                let name = firstChild.props.children;
                let href = firstChild.props.href;
                let keyword = name.split(' ')[0].replace('.', '');
 
                return {
                    name,
                    href,
                    className: `icon${keyword}`
                };
            }

            return {
                name: firstChild,
                className: `icon${String(firstChild).split(' ')[0].replace('.', '')}`
            };
        })
        .filter(Boolean);

    return (
        <div className={styles.container}>
            {children[0]}
            <div className={styles.items}>
                { items
                    .filter(item => item && item.name)
                    .map((item, index) => {
                        if (item.href) {
                            return (
                                <a key={index} className={styles.item} href={item.href}>
                                    <i className={styles[item.className]} />
                                    <h3>{item.name}</h3>
                                </a>
                            )
                        }
                        return (
                            <div key={index} className={styles.item}>
                                <i className={styles[item.className]} />
                                <h3>{item.name}</h3>
                            </div>
                        )
                    })
                }
            </div>  
        </div>
      
    )
}
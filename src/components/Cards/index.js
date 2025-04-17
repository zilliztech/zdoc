import React from 'react';
import styles from './styles.module.css';

export default function Cards({ children }) {
    var title = ''
    var items = []

    children.filter(child => child !== '\n').forEach(
        child => {
            if (child.type.name && child.type.name === 'h1') {
                title = child;
            }

            if (child.type.name && child.type.name === 'MDXUl') {
                items = child.props.children.filter(c => c !== '\n');

                items = items.map(item => {
                    const content = item.props.children.filter(c => c !== '\n');
                    const title = content[0]?.props.children;
                    const description = content[1]?.props.children;

                    return { title, description}
                })

                items = items.map(item => {
                    if (item.title === 'break') return { name: 'break' };
                    if (item.title.type.name && item.title.type.name === 'MDXA') {
                        return {
                            name: item.title.props.children,
                            href: item.title.props.href,
                            description: item.description,
                            className: `icon${item.title.props.children.split(' ')[0]}`
                        }
                    }
                })
            }
        }
    );

    return (
        <div className={styles.container}>
            { title }
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
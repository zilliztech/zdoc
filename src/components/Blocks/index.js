import React from 'react';
import styles from './styles.module.css';

export default function Block({ children }) {
    var title = ''
    var items = []

    children.filter(child => child !== '\n').forEach(
        child => {
            if (child.type.name && child.type.name === 'h1') {
                title = child;
            }

            if (child.type.name && child.type.name === 'MDXUl') {
                items = child.props.children.filter(c => c !== '\n')

                items = items.map(item => {
                    const content = item.props.children.filter(c => c !== '\n')[0]

                    if (content.type === 'p') {
                        return content.props.children
                    }
                })

                items = items.map(item => {
                    if (item.type.name && item.type.name === 'MDXA') {
                        let name = item.props.children
                        let href = item.props.href
                        let className = `icon${name.split(' ')[0]}`

                        if (className.indexOf('.')) className = className.replace('.', '')

                        return {
                            name,
                            href,
                            className
                        }
                    }
                })
            }
        }
    )

    return (
        <div className={styles.container}>
            {title}
            <div className={styles.items}>
                { items.map((item, index) => {
                    return (
                        <a key={index} className={styles.item} href={item.href}>
                            <i className={styles[item.className]} />
                            <h3>{item.name}</h3>
                        </a>
                    )
                }) }
            </div>  
        </div>
      
    )
}
import React from 'react';
import styles from './styles.module.css';

export default function Supademo({ id, title, isShowcase }) {
    let src = `https://app.supademo.com/embed/${id}?embed_v=2`

    if (isShowcase) {
        src = `https://app.supademo.com/showcase/embed/${id}?embed_v=2`

        return (
            <div className={styles.container}>
                <iframe src={src}
                    data-version="2"
                    loading="lazy" 
                    title={title} 
                    allow="clipboard-write" 
                    frameborder="0" 
                    webkitallowfullscreen="true" 
                    mozallowfullscreen="true" 
                    allowfullscreen 
                    className={styles.iframe} />
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <iframe src={src}
                loading="lazy" 
                title={title} 
                allow="clipboard-write" 
                frameborder="0" 
                webkitallowfullscreen="true" 
                mozallowfullscreen="true" 
                allowfullscreen 
                className={styles.iframe} />
        </div>
    )
}


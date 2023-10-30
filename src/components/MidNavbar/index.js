import React, { useState } from 'react';
import Link from '@docusaurus/Link';

import styles from './index.module.css';

const MidNavbarItems = [
    {
        caption: "Home",
        Svg: require('@site/static/icons/home.svg').default,
        link: "/",
    },
    {
        caption: "Guides",
        Svg: require('@site/static/icons/guides.svg').default,
        link: "/docs/quick-start",
    },
    {
        caption: "API Reference",
        Svg: require('@site/static/icons/apiref.svg').default,
        link: "/reference",
    },
    // {
    //     caption: "Discussion",
    //     Svg: require('@site/static/icons/discussion.svg').default,
    //     link: "/discussion",
    // }

]

function MidNavbarItemTplt({Svg, caption, link}) {
    return (
        <div className={styles.navbarItem}>
            <div>
                <Svg width="21" height="21" role="img" />
            </div>
            <span><Link to={link}>{caption}</Link></span>
        </div>
    )
}

export default function MidNavbar() {
    return (
        <div className={styles.navbar}>
            <div className={styles.navbarContainer}>
                {MidNavbarItems.map((props, idx) => (
                    <MidNavbarItemTplt key={idx} {...props} />
                ))}
            </div>
        </div>    
    )
}
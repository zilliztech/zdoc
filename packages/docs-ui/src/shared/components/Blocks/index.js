import React from 'react';
import styles from './styles.module.css';
import { extractEyebrow } from '@site/src/components/utils/eyebrow';
import { PythonIcon, JavaIcon, NodejsIcon, GoIcon, CppIcon, RestIcon } from '../../icons/brands.tsx';

/* The same monochrome brand glyphs the navbar's API & SDK dropdown uses — one
   mark per language across the site, instead of a second set of full-colour
   vendor logos here. Keyed by the same `icon${keyword}` name the class map used. */
/* Each mark fills its own 24-unit box differently — Python edge to edge, Go a
   short wide wordmark, the REST layers a heavy 2px stroke — so one size made
   them look like five different sizes. These are optical, measured off the
   rendered glyphs, not nominal. */
const BRAND_ICONS = {
    iconPython: [PythonIcon, 28],
    iconJava: [JavaIcon, 30],
    iconNodejs: [NodejsIcon, 30],
    iconGo: [GoIcon, 36],
    iconCpp: [CppIcon, 30],
    iconC: [CppIcon, 30],
    iconRESTful: [RestIcon, 26],
    iconREST: [RestIcon, 26],
};

function BrandMark({ name }) {
    const entry = BRAND_ICONS[name];
    if (!entry) return <span className={styles.iconWrap}><i className={styles[name]} /></span>;
    const [Icon, size] = entry;
    return (
        <span className={styles.iconWrap}>
            <Icon size={size} />
        </span>
    );
}

export default function Block({ children, eyebrow: eyebrowProp }) {
    if (!Array.isArray(children) || children.length === 0) {
        return null;
    }

    const { eyebrow, rest } = extractEyebrow(children, eyebrowProp);
    // rest[0] = section heading, rest[1] = list

    const items = React.Children.toArray(rest[1].props.children)
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
            {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
            {rest[0]}
            <div className={styles.items}>
                { items
                    .filter(item => item && item.name)
                    .map((item, index) => {
                        if (item.href) {
                            return (
                                <a key={index} className={styles.item} href={item.href}>
                                    <BrandMark name={item.className} />
                                    <h3>{item.name}</h3>
                                </a>
                            )
                        }
                        return (
                            <div key={index} className={styles.item}>
                                <BrandMark name={item.className} />
                                <h3>{item.name}</h3>
                            </div>
                        )
                    })
                }
            </div>  
        </div>
      
    )
}
import React from 'react';
import Procedures from '@site/src/components/Procedures';
import styles from './styles.module.css';
import { extractEyebrow } from '@site/src/components/utils/eyebrow';

export default function Stories({ children, eyebrow: eyebrowProp }) {
    const { eyebrow, rest } = extractEyebrow(children, eyebrowProp);
    // rest[0] = section h1, rest[1..] = h2 tabs + ol procedures
    const tabs = []
    const procedures = []

    rest.forEach((child) => {
        if (!React.isValidElement(child)) return;
        // MDX v3 wraps headings in MDXHeading components; detect via mdxTag
        const isH2 = child.type === 'h2' || child.type?.mdxTag === 'h2';
        if (isH2) {
            tabs.push(child.props.children)
        }
        if (child.type === 'ol') {
            procedures.push(child)
        }
    })

    const [activeTabId, setActiveTabId] = React.useState(0);

    const handleTabSwitch = (index) => {
        setActiveTabId(index);
    }

    const handleSelectChange = (event) => {
        setActiveTabId(parseInt(event.target.value, 10));
    }
    
    return (
        <div className={styles.stories}>
            {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
            { rest[0] }
            <ul className={styles.storiesList}>
                { tabs.map((tab, index) => {
                    return (
                        <li key={index} 
                            className = { activeTabId === index? styles.active : ''}
                            onClick={() => handleTabSwitch(index)}>
                            {tab}
                        </li>
                    )
                }) }
            </ul>
            <div className={styles.dropdownWrapper}>
                <select className={styles.dropdown} onChange={handleSelectChange} value={activeTabId}>
                    { tabs.map((tab, index) => (
                        <option key={index} value={index}>{tab}</option>
                    ))}
                </select>
            </div>
            { procedures.map((procedure, index) => {
                return (
                    <Procedures key={index} 
                        active={activeTabId === index}>
                        {procedure}
                    </Procedures>
                )
            }) 
            }
        </div>
    )    
}

import React from 'react';
import Procedures from '@site/src/components/Procedures';
import styles from './styles.module.css';

export default function Stories({ children }) {
    children = children.filter(child => child !== '\n');
    const tabs = []
    const procedures = []

    children.forEach((child, index) => {
        if (child.type.name && child.type.name === 'h2') {
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
            { children[0] }
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

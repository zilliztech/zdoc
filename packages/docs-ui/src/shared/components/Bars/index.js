import React from 'react';
import styles from './styles.module.css';
import { extractEyebrow } from '@site/src/components/utils/eyebrow';

const PLAN_DESCRIPTIONS = {
  Free: 'Start for free with generous limits, no credit card required.',
  Serverless: 'Pay only for what you use, scales automatically to zero.',
  Dedicated: 'High-performance clusters with dedicated resources.',
  BYOC: 'Deploy on your own cloud infrastructure.',
};

export default function Bars({ children, eyebrow: eyebrowProp }) {
    if (!Array.isArray(children) || children.length === 0) {
        return null;
    }

    const { eyebrow, rest } = extractEyebrow(children, eyebrowProp);

    // rest[0] = lead paragraph, rest[1] = list, rest[2] = trail paragraph
    const plans = React.Children.toArray(rest[1].props.children)
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
                return { name: '', href: '' };
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
            {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
            <p className={styles.lead}>{ rest[0]?.props?.children || rest[0] }</p>
            <ul className={styles.list}>
                { plans.map((plan, index) => {
                    const description = PLAN_DESCRIPTIONS[plan.name] || '';
                    const cardContent = (
                        <>
                            <span className={styles.iconWrap}>
                                <i className={styles[`icon${plan.name}`]} />
                            </span>
                            <span className={styles.cardTitle}>{plan.name}</span>
                            {description && <span className={styles.cardDesc}>{description}</span>}
                            <span className={styles.arrow} aria-hidden="true">→</span>
                        </>
                    );

                    if (plan.href) {
                        return (
                            <li key={index} className={styles.item}>
                                <a href={plan.href} className={styles.cardLink}>
                                    {cardContent}
                                </a>
                            </li>
                        );
                    }

                    return (
                        <li key={index} className={styles.item}>
                            {cardContent}
                        </li>
                    );
                })}
            </ul>
            <p className={styles.trail}>{ rest[2]?.props?.children || rest[2] }</p>
        </div>
    );
}

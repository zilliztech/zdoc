import React from 'react';
import styles from './styles.module.css';

function Procedure() {
    const steps = [
        { number: 1, title: 'Step 1', description: 'Description for step 1' },
        { number: 2, title: 'Step 2', description: 'Description for step 2' },
        { number: 3, title: 'Step 3', description: 'Description for step 3' }
    ];

    return (
        <div className={styles.procedure}>
            {steps.map((step, index) => (
                <div key={step.number} className={styles.step}>
                    <div className={styles.stepNumber}>
                        <span>{step.number}</span>
                        {index < steps.length - 1 && <div className={styles.connector}></div>}
                    </div>
                    <div className={styles.stepContent}>
                        <h3>{step.title}</h3>
                        <p>{step.description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function Home() {

    const plans = [
        'Free',
        'Serverless',
        'Dedicated',
        'BYOC'
    ]

    const tabs = [
        'Bring Your Own Vectors',
        'Migrate From Other Data Infra',
        'Backup and Restore'
    ]

    const features = [
        {
            class: 'featureIconMonitor',
            name: 'Monitor & Alert',
            description: 'Monitor your clusters and get alerts on time.'
        },
        {
            class: 'featureIconAccess',
            name: 'Acess Control',
            description: 'Secure your data with fine-grained access control.'
        },
        {
            class: 'featureIconPrivate',
            name: 'Private Networking',
            description: 'Connect your clusters to your private network.'
        },
        {
            break: true
        },
        {
            class: 'featureIconBilling',
            name: 'Billing',
            description: 'Pay only for what you use, with no upfront costs.'
        },
        {
            class: 'featureIconIntegrations',
            name: 'Integrations',
            description: 'Integrate with your existing tools and workflows.'
        }
    ]

    const languages = [
        {
            name: 'Python',
            img: '/icons/lang-python.svg'
        },
        {
            name: 'Java',
            img: '/icons/lang-java.svg'
        },
        {
            name: 'Go',
            img: '/icons/lang-go.svg'
        },
        {
            name: 'Node.js',
            img: '/icons/lang-node.svg'
        },
        {
            name: 'RESTful API',
            img: '/icons/lang-rest.svg'
        }
    ]

    const [activeTabId, setActiveTabId] = React.useState(0);

    const handleTabSwitch = (index) => {
        setActiveTabId(index);
    }

    return (
        <>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.subtract}>
                        <h1>Welcome to Zilliz Cloud Docs</h1>
                        <h4>Zilliz Cloud provides a fully managed Milvus service, simplifying the deployment and scaling of vector search applications with security in mind, eliminating the need to construct and maintain complex infrastructure. <a href="/docs/get-started">Learn more</a></h4>
                    </div>
                    <div className={styles.heroImg}>
                        <img src="/img/hero.png" alt="Milvus Hero Image" />
                    </div>
                </div>
                <div className={styles.plans}>
                    <p className={styles.plansLead}>You can create clusters in the following plans:</p>
                    <div className={styles.plansList}>
                        { plans.map((plan, index) => {
                            return (
                                <div key={index} className={styles.plan}>
                                    <i className={styles[`planIcon${plan}`]}></i>
                                    <span>{plan}</span>
                                </div>
                            )
                        })}
                    </div>
                    <p className={styles.plansTrail}>
                        <a href="/docs/select-zilliz-cloud-service-plans">Not sure what's the right plan for you?</a>
                    </p>
                </div>
            </div>
            <div className={styles.stories}>
                <h2>Work with Your Data in Zilliz Cloud</h2>
                <ul className={styles.storiesList}>
                    { tabs.map((tab, index) => {
                        return (
                            <li key={index} 
                                className = { activeTabId === index? styles.active : ''} 
                                onClick={() => handleTabSwitch(index)}>
                                {tab}
                            </li>
                        )
                    })}
                </ul>
                <Procedure />
            </div>
            <div className={styles.container}>
                <h1>Go Further with Zilliz Cloud</h1>
                <div className={styles.features}>
                    { features.map((feature, index) => {
                        if (feature.break) {
                            return <div key={index} className={styles.featureBreak}></div>
                        } else {
                            return (
                                <div key={index}
                                    className={styles.feature}>
                                    <span className={styles.featureIconContainer}>
                                        <i className={styles[feature.class]}></i>
                                    </span>
                                    <h3>{feature.name}</h3>
                                    <p>{feature.description}</p>
                                </div>
                            )
                        }
                    })}
                </div>
            </div>
            <div className={styles.container}>
                <h1>Start Building with Your Preferred Language</h1>
                <div className={styles.languages}>
                    { languages.map((language, index) => {
                        return (
                            <div key={index} className={styles.language}>
                                <img src={language.img} alt={language.name} />
                                <h3>{language.name}</h3>
                            </div>
                        )
                    }) }
                </div>
                <div className={styles.banner}>
                    <span className={styles.bannerText}>
                        Can't find what you're looking for?
                    </span>
                    <span className={styles.bannerLink}>
                        <span>Try Ask AI</span>
                        <img src="/icons/zilliz-start.svg" />
                    </span>
                </div>
            </div>
        </>
    );
}
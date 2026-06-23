import React, { useEffect, useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import RestHeader from '../RestHeader';
import Admonition from '@theme/Admonition'
import CodeBlock from '@theme/CodeBlock'
import { textFilter, getBaseUrl, getRandomString, chooseParamExample, filterSchemaOptions, getExampleLabel, isControlPlane } from './utils'
import { i18n } from './i18n'
import styles from'./index.module.css';
import { cond, set } from 'lodash';

const primitiveConstants = ["boolean", "integer", "number", "string"]

const BaseURL = ({ endpoint, lang, target, baseUrls, onBaseUrlChange }) => {
    const [selectedBaseUrl, setSelectedBaseUrl] = useState(0)
    const { siteConfig } = useDocusaurusContext()
    const planeConfig = siteConfig.customFields?.planeConfig

    // If no custom base URLs, fall back to auto-detection
    if (!baseUrls || baseUrls.length === 0) {
        const { server, children, prompt } = getBaseUrl(endpoint, lang, target, planeConfig)
        return (<>
            <section>
                <section className={styles.sectionHeader}>
                    <span>{i18n[lang]['title.connection.endpoint']}</span>
                </section>
                <div style={{margin: '1rem 0'}}>
                    <p>{i18n[lang]['base.url.format.prompt']}</p>
                    <p className={styles.paramName} style={{ fontSize: '0.9rem' }}>{server}</p>
                </div>
                { prompt && <Admonition type="info" icon="📘" title={i18n[lang]["admonition.title"]}>
                    <div dangerouslySetInnerHTML={{__html: prompt}} />
                </Admonition>}
            </section>
            <section className={styles.exampleContainer}>
                <CodeBlock className="language-shell" children={children} />
            </section>
        </>)
    }

    const current = baseUrls[selectedBaseUrl]
    const resolvedPrompt = current["x-i18n"]?.[lang]?.prompt ?? current.prompt
    const resolvedLabel = current["x-i18n"]?.[lang]?.label ?? current.label
    const resolvedUrl = current["x-i18n"]?.[lang]?.url ?? current.url
    const { prompt: defaultPrompt } = getBaseUrl(endpoint, lang, target, planeConfig)

    return (<>
        <section>
            <section className={styles.sectionHeader}>
                <span>{i18n[lang]['title.connection.endpoint']}</span>
            </section>

            {/* Tab toggle */}
            {baseUrls.length > 1 && (
                <div className={styles.tabs} style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                    {baseUrls.map((item, index) => (
                        <React.Fragment key={index}>
                            <input
                                name="baseurl-toggle"
                                type="radio"
                                id={`baseurl-tab-${index}`}
                                checked={selectedBaseUrl === index}
                                value={index}
                                onChange={() => {
                                    setSelectedBaseUrl(index)
                                    if (onBaseUrlChange) {
                                        onBaseUrlChange(baseUrls[index])
                                    }
                                }}
                            />
                            <label className={styles.tabLabel} htmlFor={`baseurl-tab-${index}`}>
                                {item["x-i18n"]?.[lang]?.label ?? item.label}
                            </label>
                        </React.Fragment>
                    ))}
                </div>
            )}

            <div style={{margin: '1rem 0'}}>
                <p>{i18n[lang]['base.url.format.prompt']}</p>
                <p className={styles.paramName} style={{ fontSize: '0.9rem' }}>{resolvedUrl}</p>
            </div>
            { (defaultPrompt || resolvedPrompt) && <Admonition type="info" icon="📘" title={i18n[lang]["admonition.title"]}>
                { resolvedPrompt && (
                    <ul>
                        <li dangerouslySetInnerHTML={{__html: resolvedPrompt}} />
                    </ul>
                )}
                { defaultPrompt && current?.key !== 'on-demand-compute' && <div dangerouslySetInnerHTML={{__html: defaultPrompt}} /> }
            </Admonition>}
        </section>
        <section className={styles.exampleContainer}>
            <CodeBlock className="language-shell" children={current.shell} />
        </section>
    </>)
}

const Admonitions = ({ admonitions, lang }) => {
    if (!admonitions || admonitions.length === 0) {
        return null
    }

    return (
        <>
            {admonitions.map((item, index) => {
                const title = item["x-i18n"]?.[lang]?.title ?? item.title
                const content = item["x-i18n"]?.[lang]?.content ?? item.content
                return (
                    <Admonition
                        key={index}
                        type={item.type || 'info'}
                        title={title || item.type || 'Note'}
                    >
                        <div dangerouslySetInnerHTML={{ __html: content }} />
                    </Admonition>
                )
            })}
        </>
    )
}

const Param = ({ name, description, type, format, required, example, inProp, enums, lang, target, x_i18n, admonitions }) => {

    enums = enums? enums : []
    const translatedDescription = x_i18n?.[lang]?.description ? x_i18n[lang].description : description

    return (
        <div className={styles.paramContainer}>
            <div className={styles.paramLabels}>
                <span className={styles.paramName}>{name}</span>
                <span className={styles.label}>{type + (format ? "\<" + format + "\>" : "")}</span>
                <span className={styles.label}>{inProp}</span>
                { required && <span className={styles.required}>required</span> }
            </div>
            <div className={styles.description} dangerouslySetInnerHTML={{__html: translatedDescription ? textFilter(translatedDescription, target) : `<i>${i18n[lang]["to.be.added.soon"]}</i>`}}></div>
            <div>
                { admonitions && admonitions.length > 0 && <Admonitions admonitions={admonitions} lang={lang} /> }
                { enums.length > 0 && <Enums enums={enums} lang={lang} target={target} /> }
                { (example === 0 || example) && <div>
                    <span className={styles.paramExample}>{i18n[lang]['label.example.value']}</span>
                    <span className={styles.label}>{example}</span>
                </div> }
            </div>
        </div>
    )
}

const Properties = ({ name, description, properties, requiredFields, required, lang, target }) => {
    return (
        <>
            { (name || description) && <div className={styles.paramContainer}>
                { name && <div className={styles.paramLabels}>
                    <span className={styles.paramName}>{name}</span>
                    <span className={styles.label}>object</span>
                    { required && <span className={styles.required}>required</span> }
                </div> }
                { description && <div className={styles.description} dangerouslySetInnerHTML={{__html: description ? textFilter(description, target) : `<i>${i18n[lang]["to.be.added.soon"]}</i>`}}></div> }
            </div> }
            <div style={{ margin: name ? '0 0 0 2rem' : '0' }}>
                { properties && Object.keys(properties).filter(key => {
                    if (Object.keys(properties[key]).includes('x-include-target')) {
                        return properties[key]['x-include-target'].includes(target)
                    }

                    return true
                }).map((propName, index) => {
                    const prop = properties[propName]
                    const desc = prop["x-i18n"]?.[lang]?.description ? prop["x-i18n"][lang].description : prop.description
                    const requireds = requiredFields instanceof Array ? requiredFields : []
                    if (prop.type === 'object') {
                        return (
                            <Properties key={index} 
                                name={propName} 
                                description={textFilter(desc, target)}
                                properties={prop.properties} 
                                requiredFields={prop.required} 
                                required={requireds.includes(propName)}
                                lang={lang}
                                target={target} />
                        )
                    } else if (prop.type === 'array') {
                        return (
                            <Items key={index} 
                                name={propName} 
                                description={textFilter(desc, target)} 
                                obj={prop} 
                                required={requireds.includes(propName)}
                                lang={lang}
                                target={target} />
                        )
                    } else if (prop?.anyOf) {
                        return (
                            <AnyOf key={index} 
                                name={propName} 
                                description={textFilter(desc, target)} 
                                arr={prop.anyOf} 
                                required={requireds.includes(propName)}
                                lang={lang}
                                target={target} />
                        )
                    } else if (prop?.oneOf) {
                        return (
                            <OneOf key={index} 
                                name={propName} 
                                description={textFilter(desc, target)} 
                                arr={prop.oneOf} 
                                required={requireds.includes(propName)}
                                lang={lang}
                                target={target} />
                        )
                    } else {
                        return (
                            <Primitive key={index} 
                                name={propName} 
                                obj={prop} 
                                required={requireds.includes(propName)}
                                lang={lang}
                                target={target} />
                        )
                    }
                }) } 
            </div>
       
        </>
    )
}

const Items = ({ name, description, obj, required, lang, target }) => {
    return (
        <>
            { (name || description) && <div className={styles.paramContainer}>
                { name &&<div className={styles.paramLabels}>
                    <span className={styles.paramName}>{name}</span>
                    <span className={styles.label}>array</span>
                    { required && <span className={styles.required}>required</span> }
                </div> }
                { description && <div className={styles.description} dangerouslySetInnerHTML={{__html: description ? textFilter(description, target) : `<i>${i18n[lang]["to.be.added.soon"]}</i>`}}></div> }
            </div> }
            <div style={{ margin: name ? '0 0 0 2rem' : '0' }}>
                { obj.items && Object.keys(obj.items).includes('anyOf') && <AnyOf name={`[]${name}`} description={obj.items["x-i18n"]?.[lang]?.description ? obj.items["x-i18n"][lang].description : obj.items.description}
                    arr={obj.items.anyOf} required={obj.items.required}
                    lang={lang}
                    target={target} /> }
                { obj.items && Object.keys(obj.items).includes('oneOf') && <OneOf name={`[]${name}`} description={obj.items["x-i18n"]?.[lang]?.description ? obj.items["x-i18n"][lang].description : obj.items.description}
                    arr={obj.items.oneOf} required={obj.items.required}
                    lang={lang}
                    target={target} /> }
                { obj.items?.type === 'object' && <Properties name={`[]${name}`}
                    description={obj.items["x-i18n"]?.[lang]?.description ? obj.items["x-i18n"][lang].description : obj.items.description}
                    properties={obj.items.properties}
                    requiredFields={obj.items.required}
                    required={required}
                    lang={lang}
                    target={target} /> }
                { obj.items?.type === 'array' && <Items name={`[]${name}`}
                    description={obj.items["x-i18n"]?.[lang]?.description ? obj.items["x-i18n"][lang].description : obj.items.description}
                    obj={obj.items.items}
                    required={obj.items.items.required}
                    lang={lang}
                    target={target}  />}
                { primitiveConstants.includes(obj.items?.type) && obj.items?.type && <Primitive name={`[]${name}`}
                    obj={obj.items} 
                    required={obj.items.required}
                    lang={lang}
                    target={target} />}
            </div>
        </>
    )
}

const Primitive = ({ name, obj, required, lang, target }) => {
    const { type, format, minimum, maximum, defaultValue } = obj;
    const description = obj["x-i18n"]?.[lang]?.description ? obj["x-i18n"][lang].description : obj.description
    const example = obj["x-i18n"]?.[lang]?.example ? obj["x-i18n"][lang].example : obj.example
    const enums = obj.enum ? obj.enum : []
    const admonitions = obj['x-admonition']

    return (
        <div className={styles.paramContainer}>
            <div className={styles.paramLabels}>
                <span className={styles.paramName}>{name}</span>
                <span className={styles.label}>{type + (format ? "\<" + format + "\>" : "")}</span>
                { required && <span className={styles.required}>{i18n[lang]['label.required']}</span> }
            </div>
            <div className={styles.description} dangerouslySetInnerHTML={{__html: description ? textFilter(description, target) : `<i>${i18n[lang]["to.be.added.soon"]}</i>`}}></div>
            <div>
                { admonitions && admonitions.length > 0 && <Admonitions admonitions={admonitions} lang={lang} /> }
                { (minimum || maximum) && <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className={styles.paramExample}>{i18n[lang]['label.value.range']}</span>
                    { minimum &&<span className={styles.label}>{obj.exclusiveMinimum ? `\> ${minimum}` : `\≥ ${minimum}`}</span>}
                    { maximum &&<span className={styles.label}>{obj.exclusiveMaximum ? `\< ${maximum}` : `\≤ ${maximum}`}</span>}
                </div> }
                { enums.length > 0 && <Enums enums={enums} defaultValue={defaultValue} lang={lang} target={target} /> }
                { defaultValue && <div>
                    <span className={styles.paramExample}>{i18n[lang]['label.default.value']}</span>
                    <span className={styles.label}>{defaultValue}</span>
                </div> }
                { (example === 0 || example) && <div>
                    <span className={styles.paramExample}>{i18n[lang]['label.example.value']}</span>
                    <span className={styles.label}>{example}</span>
                </div> }
            </div>
        </div>
    )
}

const Enums = ({ enums, defaultValue, lang, target }) => {
    const [ enumItem, setEnumItem ] = useState(defaultValue ? defaultValue : enums[0])

    const handleEnumChange = (e) => {
        setEnumItem(e.target.value)
    }

    return (
        <div className={styles.description} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', alignItems: 'center' }}>
            <label htmlFor="enumSelect" className={styles.paramExample}>{i18n[lang]['label.possible.values']}</label>
            <div>
                <select id="enumSelect" value={enumItem} onChange={handleEnumChange}>
                    {enums.map((enumValue) => textFilter(enumValue, target))
                        .filter(enumValue => enumValue !== '').map((enumValue, index) => {
                            enumValue = enumValue.replace(/<\/?p>/g, "").replace(/<\/?em>/g, "_")
                            return (
                                <option key={index} value={enumValue}>{enumValue}</option>
                            )
                        })}
                </select>
            </div>
        </div>
    )
}

const Tab = ({ name, id, content, lang, target, selected, setSelected, optionValue }) => {
    // Handle undefined content
    if (!content) {
        return null
    }
    
    const value = optionValue || (content.label ? content.label : `${i18n[lang]["tab.option"]} ${id}`).toUpperCase()
    const label = (content?.['x-tab-label'] ? content['x-tab-label'] : value).toUpperCase()
    
    // Handle x-i18n for content description
    const translatedDescription = content?.["x-i18n"]?.[lang]?.description ? content["x-i18n"][lang].description : content?.description

    return (
        <>
            <input 
                name={name} 
                type="radio"  
                id={`${name}-tab${id}`} 
                checked={selected === value}
                value={value}
                onChange={e => { setSelected(e.target.value) }} />
            <label className={styles.tabLabel} htmlFor={`${name}-tab${id}`}>{label}</label>
            <div className={styles.tabPanel}>
                { content?.type === 'object' && <Properties description={translatedDescription} properties={content.properties} requiredFields={content.required} lang={lang} target={target} /> }
                { content?.type === 'array' && <Items description={translatedDescription} obj={content.items} required={content.items.required} lang={lang} target={target} /> }
                { (content?.type === 'string' || content?.type === 'number' || content?.type === 'integer' || content?.type === 'boolean') && <Primitive obj={{...content, description: translatedDescription}} lang={lang} target={target} /> }
                { content?.type === 'code' && <CodeBlock className="language-json" children={JSON.stringify(content.value, null, 4)} /> }
                { content?.type === 'reqs' && <CodeBlock className="language-bash" children={content.value} /> }
            </div>
        </>
    )
}

const AnyOf = ({ name, description, arr, required, lang, target, onValueChange, x_i18n }) => {
    const r = getRandomString(5)
    const translatedDescription = x_i18n?.[lang]?.description ? x_i18n[lang].description : description
    const validItems = filterSchemaOptions(arr, lang, target)

    // Map tab labels to option values for responses and requestBody
    const getOptionValue = (label, index) => {
        if (name === 'responses' || name === 'requestBody') {
            // For responses and requestBody, map labels to OPTION 1, OPTION 2, etc.
            return `OPTION ${index + 1}`
        }
        return (label ? label : `${i18n[lang]["tab.option"]} ${index + 1}`).toUpperCase()
    }

    const defaultValue = validItems.length > 0 ? getOptionValue(validItems[0].item.label, validItems[0].originalIndex) : ''
    const [ selected, setSelected ] = useState(defaultValue)

    useEffect(() => {
        if (defaultValue && selected !== defaultValue) {
            setSelected(defaultValue)
        }
        if (onValueChange && defaultValue) {
            onValueChange(defaultValue)
        }
    }, [defaultValue])

    if (validItems.length === 0) {
        return null
    }

    const setSelectedOption = (value) => {
        setSelected(value)
        if (onValueChange) {
            onValueChange(value)
        }
    }

    return (<>
        { (name && name !== 'responses' && name !== 'requestBody') && <div className={styles.paramContainer}>
            <div className={styles.paramLabels}>
                <span className={styles.paramName}>{name}</span>
                <span className={styles.label}>anyOf</span>
                { required && <span className={styles.required}>required</span> }
            </div>
            <div className={styles.description} dangerouslySetInnerHTML={{__html: translatedDescription ? textFilter(translatedDescription, target) : `<i>${i18n[lang]["to.be.added.soon"]}</i>`}}></div>
        </div> }
        <div style={{ margin: (name && name !== 'responses' && name !== 'requestBody') ? '0 0 0 2rem' : '0' }}>
            <div className={styles.tabs} style={{ marginTop: '1rem' }}>
                {validItems.map(({ item, originalIndex }) => {
                    const optionValue = getOptionValue(item.label, originalIndex)
                    return (
                        <Tab key={originalIndex}
                            name={`${name}-${r}`} 
                            id={originalIndex+1}
                            content={item} 
                            lang={lang} 
                            target={target}
                            selected={selected}
                            setSelected={setSelectedOption}
                            optionValue={optionValue} />
                    )
                })}
            </div>
        </div>
    </>)
}

const OneOf = ({ name, description, arr, required, lang, target, onValueChange, x_i18n }) => {
    const r = getRandomString(5)
    const translatedDescription = x_i18n?.[lang]?.description ? x_i18n[lang].description : description
    const validItems = filterSchemaOptions(arr, lang, target)

    // Map tab labels to option values for responses and requestBody
    const getOptionValue = (label, index) => {
        if (name === 'responses' || name === 'requestBody') {
            // For responses and requestBody, map labels to OPTION 1, OPTION 2, etc.
            return `OPTION ${index + 1}`
        }
        return (label ? label : `${i18n[lang]["tab.option"]} ${index + 1}`).toUpperCase()
    }

    const defaultValue = validItems.length > 0 ? getOptionValue(validItems[0].item.label, validItems[0].originalIndex) : ''
    const [ selected, setSelected ] = useState(defaultValue)

    useEffect(() => {
        if (defaultValue && selected !== defaultValue) {
            setSelected(defaultValue)
        }
        if (onValueChange && defaultValue) {
            onValueChange(defaultValue)
        }
    }, [defaultValue])

    if (validItems.length === 0) {
        return null
    }

    const setSelectedOption = (value) => {
        setSelected(value)
        if (onValueChange) {
            onValueChange(value)
        }
    }

    return (<>
        { (name && name !== 'responses' && name !== 'requestBody') && <div className={styles.paramContainer}>
            <div className={styles.paramLabels}>
                <span className={styles.paramName}>{name}</span>
                <span className={styles.label}>oneOf</span>
                { required && <span className={styles.required}>required</span> }
            </div>
            <div className={styles.description} dangerouslySetInnerHTML={{__html: translatedDescription ? textFilter(translatedDescription, target) : `<i>${i18n[lang]["to.be.added.soon"]}</i>`}}></div>
        </div> }
        <div style={{ margin: (name && name !== 'responses' && name !== 'requestBody') ? '0 0 0 2rem' : '0' }}>
            <div className={styles.tabs} style={{ marginTop: '1rem' }}>
                {validItems.map(({ item, originalIndex }) => {
                    const optionValue = getOptionValue(item.label, originalIndex)
                    return (
                        <Tab key={originalIndex}
                            name={`${name}-${r}`} 
                            id={originalIndex+1}
                            content={item} 
                            lang={lang} 
                            target={target}
                            selected={selected}
                            setSelected={setSelectedOption}
                            optionValue={optionValue} />
                    )
                })}
            </div>
        </div>
    </>)
}

const ExampleResponses = ({ examples, lang, target, selectedResponse }) => {
    const r = getRandomString(5)

    const validKeys = Object.keys(examples).filter(key => {
        var condition = true

        if (Object.keys(examples[key]).includes('x-include-target')) {
            condition = condition && examples[key]["x-include-target"].includes(target)
        }

        if (Object.keys(examples[key]).includes('x-target-lang')) {
            condition = condition && examples[key]["x-target-lang"] === lang
        }

        if (Object.keys(examples[key]).includes('x-target-response')) {
            condition = condition && examples[key]["x-target-response"] === selectedResponse
        }

        return condition
    })

    // Handle case where no valid keys are found
    const defaultValue = validKeys.length > 0 ? getExampleLabel(examples[validKeys[0]], validKeys[0]).toUpperCase() : ''
    const availableLabels = validKeys.map(key => getExampleLabel(examples[key], key).toUpperCase())
    const [ selected, setSelected ] = useState(defaultValue)

    // Only update selection if there are available labels and current selection is invalid
    if (availableLabels.length > 0 && !availableLabels.includes(selected)) {
        setSelected(availableLabels[0])
    }

    return (
        <div className={styles.tabs} style={{ marginTop: '1rem' }}>
            {validKeys.map((key, index) => {
                return (
                    <Tab key={index} 
                        name={"resExamples" + '-' + r} 
                        id={parseInt(key)} 
                        content={{ type: 'code', label: getExampleLabel(examples[key], key), value: examples[key].value }}
                        lang={lang}
                        target={target}
                        selected={selected}
                        setSelected={setSelected} />
                )
            })}
        </div>
    )
}

const ExampleRequests = ({ endpoint, method, headersExample, pathExample, queryExample, requestBody, lang, target, selectedRequest, baseUrl, selectedBaseUrl }) => {
    const { siteConfig } = useDocusaurusContext()
    const planeConfig = siteConfig.customFields?.planeConfig
    const condition = isControlPlane(endpoint, target, planeConfig)
    const effectiveBaseUrl = baseUrl ? baseUrl : (condition ? "\${BASE_URL}" : "\${CLUSTER_ENDPOINT}")
    const token = (condition || selectedBaseUrl?.key === 'on-demand-compute') ? 'YOUR_API_KEY' : "db_admin:xxxxxxxxxxxxx"
    var req = `export TOKEN="${token}"${pathExample ? "\n"+pathExample : ''}\n\ncurl --request ${method.toUpperCase()} \\\n--url "${effectiveBaseUrl}${endpoint}`
    req = (queryExample ? `${req}?${queryExample}` : req) + `"`
    req = headersExample ? `${req} \\\n${headersExample + ` \\\n--header "Request-Timeout: 5"`  + ` \\\n--header "Content-Type: application/json"`}` : req

    if (requestBody?.content['application/json']?.example) {
        req += ` \\\n-d '${JSON.stringify(requestBody.content['application/json'].example, null, 4)}'`
        return (
            <CodeBlock className="language-bash" children={req} />
        )
    }

    if (!requestBody) {
        return (
            <CodeBlock className="language-bash" children={req} />
        )
    }

    if (requestBody?.content['application/json']?.examples) {
        const r = getRandomString(5)
        const examples = requestBody.content['application/json'].examples
        const validKeys = Object.keys(examples).filter(key => {
            var condition = true

            if (Object.keys(examples[key]).includes('x-include-target')) {
                condition = examples[key]["x-include-target"].includes(target)
            }

            if (Object.keys(examples[key]).includes('x-target-lang')) {
                condition = condition && examples[key]["x-target-lang"] === lang
            }

            if (Object.keys(examples[key]).includes('x-target-request')) {
                condition = condition && examples[key]["x-target-request"] === selectedRequest
            }

            return condition
        })

        // Handle case where no valid keys are found
        const defaultValue = validKeys.length > 0 ? getExampleLabel(examples[validKeys[0]], validKeys[0]).toUpperCase() : ''
        const availableLabels = validKeys.map(key => getExampleLabel(examples[key], key).toUpperCase())
        const [ selected, setSelected ] = useState(defaultValue)

        // Only update selection if there are available labels and current selection is invalid
        if (availableLabels.length > 0 && !availableLabels.includes(selected)) {
            setSelected(availableLabels[0])
        }

        return (
            <div className={styles.tabs} style={{ marginTop: '1rem' }}>
                {validKeys.map((key, index) => {
                    return (
                        <Tab key={index}
                            name={"reqExamples" + '-' + r}
                            id={parseInt(key)}
                            content={{ type: 'reqs', label: getExampleLabel(examples[key], key), value: `${req} \\\n-d '${JSON.stringify(examples[key].value, null, 4)}'` }}
                            lang={lang}
                            target={target}
                            selected={selected}
                            setSelected={setSelected} />
                    )
                })}
            </div>
        ) 
    }
}

export default function RestSpecs(props) {
    const { 
        summary, 
        tags, 
        parameters, 
        requestBody, 
        responses,
        description, 
        deprecated,
    } = props.specs;

    const target = props.target
    const lang = props.lang ? props.lang : 'en-US'
    const admonitions = props.specs['x-admonition']
    const baseUrls = props.specs['x-base-urls']
    const endpoint = props.endpoint.replaceAll('{', '${')
    const [ selectedBaseUrl, setSelectedBaseUrl ] = useState(() =>
        target === 'zilliz' && Array.isArray(baseUrls) && baseUrls.length > 0 ? baseUrls[0] : null
    )
    const selectedBaseUrlVar = selectedBaseUrl?.shell?.match(/export\s+(\w+)=/)?.[1]
    const exampleBaseUrl = selectedBaseUrlVar ? `\${${selectedBaseUrlVar}}` : selectedBaseUrl?.url
    const validParams = parameters ? parameters.filter(param => {
        if (param?.['x-include-target'] && !param['x-include-target'].includes(target)) return false
        if (param?.['x-base-url-target']) {
            const currentKey = selectedBaseUrl?.key
            if (!currentKey || !param['x-base-url-target'].includes(currentKey)) return false
        }
        return true
    }) : []

    const short = textFilter(description, target)
    const headerParams = validParams ? validParams.filter(param => param.in === 'header') : []
    const headersExample = headerParams.map(param => `--header "${param.name}: ${param.example}"`).join(' \\\n').replace(/{{/g, '${').replace(/}}/g, '}')
    const pathParams = validParams ? validParams.filter(param => param.in === 'path') : []
    const pathExample = pathParams.map(param => {
        param = chooseParamExample(param, lang, target)
        return `export ${param.name}="${param.example}"`
    }).join('\n')
    const queryParams = validParams ? validParams.filter(param => param.in === 'query') : []
    const queryExample = queryParams.map(param => {
        param = chooseParamExample(param, lang, target)
        return (param.required ? `${param.name}=${param.example}` : '')
    }).filter(param => param !== '').join('&')
    const responseExample = responses?.['200']?.content['application/json']?.examples

    const [ selectedRequest, setSelectedRequest ] = useState("OPTION 1")
    const [ selectedResponse, setSelectedResponse ] = useState("OPTION 1")

    const handleMultipleRequests = (value) => {
        setSelectedRequest(value.toUpperCase())
    }

    const handleMultipleResponses = (value) => {
        setSelectedResponse(value.toUpperCase())
    }

    return (
        <>
            <div>
                <div className={styles.specLayout}>
                    <div>
                        <Admonitions admonitions={admonitions} lang={lang} />
                        { deprecated && <Admonition type="danger" title={i18n[lang]["admonition.title"]}>
                            <div dangerouslySetInnerHTML={{ __html: i18n[lang]["admonition.deprecated"] }} />
                        </Admonition> }
                        <div style={{ marginBottom: '1rem' }} dangerouslySetInnerHTML={{__html: short}} />
                        <RestHeader
                            method={props.method}
                            endpoint={props.endpoint}
                        />
                    </div>
                </div>
                <div className={styles.specLayout}>
                    <BaseURL endpoint={props.endpoint} lang={lang} target={target} baseUrls={target === 'zilliz' ? baseUrls : null} onBaseUrlChange={setSelectedBaseUrl} />
                    { (parameters.length > 0 || requestBody) && <>
                        <section>
                            { parameters.length > 0 && <section>
                                <div className={styles.sectionHeader}>
                                    <span>{i18n[lang]['section.parameters']}</span>
                                </div>
                                { headerParams.length > 0 && headerParams.map((param, index) => {
                                    param = chooseParamExample(param, lang, target)
                                    return (
                                        <Param
                                            key={index}
                                            lang={lang}
                                            target={target}
                                            name={param.name}
                                            description={param.description}
                                            type={param.schema.type}
                                            required={param.required}
                                            example={param.example}
                                            inProp={param.in}
                                            enums={param.schema.enum}
                                            x_i18n={param["x-i18n"]}
                                            admonitions={param['x-admonition']} />
                                    )
                                })}
                                { pathParams.length > 0 && pathParams.map((param, index) => {
                                    param = chooseParamExample(param, lang, target)
                                    return (
                                        <Param
                                            key={index}
                                            lang={lang}
                                            target={target}
                                            name={param.name}
                                            description={ param["x-i18n"]?.[lang]?.description ? param["x-i18n"]?.[lang]?.description : param.description }
                                            type={param.schema.type}
                                            required={param.required}
                                            example={param.example}
                                            inProp={param.in}
                                            enums={param.schema.enum}
                                            admonitions={param['x-admonition']} />
                                    )
                                })}
                                { queryParams.length > 0 && queryParams.map((param, index) => {
                                    param = chooseParamExample(param, lang, target)
                                    return (
                                        <Param
                                            key={index}
                                            lang={lang}
                                            target={target}
                                            name={param.name}
                                            description={ param["x-i18n"]?.[lang]?.description ? param["x-i18n"]?.[lang]?.description : param.description }
                                            type={param.schema.type}
                                            required={param.required}
                                            example={param.example}
                                            inProp={param.in}
                                            enums={param.schema.enum}
                                            admonitions={param['x-admonition']} />
                                    )
                                })}
                            </section>}
                            { requestBody && <section>
                                <section>
                                    <div className={styles.sectionHeader} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <span>{i18n[lang]['section.request.body']}</span>
                                        { Object.keys(requestBody.content).includes('application/json') && <span style={{ color: 'rgb(74, 83, 104)', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                                            application/json</span>}
                                    </div>
                                    <div style={{ margin: '1rem' }} />
                                    { requestBody.content['application/json']?.schema?.type === 'object' && <Properties properties={requestBody.content['application/json'].schema.properties} 
                                        requiredFields={requestBody.content['application/json'].schema.required} 
                                        target={target}
                                        lang={lang} /> }
                                    { requestBody.content['application/json']?.schema?.type === 'array' && <Items name="[]requestBody"
                                        description= {requestBody.content['application/json'].schema.description}
                                        obj={requestBody.content['application/json'].schema.items}
                                        required={requestBody.content['application/json'].schema.items.required}
                                        lang={lang}
                                        target={target} /> }
                                    { requestBody.content['application/json']?.schema?.anyOf && <AnyOf name="requestBody"
                                        arr={requestBody.content['application/json'].schema.anyOf}
                                        lang={lang}
                                        target={target}
                                        onValueChange={handleMultipleRequests}
                                        x_i18n={requestBody.content['application/json'].schema["x-i18n"]} /> }
                                    { requestBody.content['application/json']?.schema?.oneOf && <OneOf name="requestBody"
                                        arr={requestBody.content['application/json'].schema.oneOf} 
                                        lang={lang}
                                        target={target}
                                        onValueChange={handleMultipleRequests}
                                        x_i18n={requestBody.content['application/json'].schema["x-i18n"]} /> }
                                    { requestBody.content['application/json']?.schema?.type !== 'object' && requestBody.content['application/json']?.schema?.type !== 'array' 
                                     && !Object.keys(requestBody.content['application/json'].schema).includes('anyOf') && !Object.keys(requestBody.content['application/json'].schema).includes('oneOf') && <Primitive name="requestBody"
                                        obj={requestBody.content['application/json'].schema}
                                        lang={lang}
                                        target={target} /> }
                                </section>
                            </section>}
                        </section>
                        <section className={styles.exampleContainer}>
                            {/* <CodeBlock className="language-bash" children={req} /> */}
                            <ExampleRequests endpoint={endpoint}
                                method={props.method}
                                headersExample={headersExample}
                                pathExample={pathExample}
                                queryExample={queryExample}
                                requestBody={requestBody}
                                lang={lang}
                                target={target}
                                selectedRequest={selectedRequest}
                                baseUrl={exampleBaseUrl}
                                selectedBaseUrl={selectedBaseUrl} />
                        </section>
                    </>}
                </div>
                
                { responses && <div className={styles.specLayout}>
                    <section>
                        <div className={styles.sectionHeader} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                            <span>{i18n[lang]['section.responses']}</span>
                            { Object.keys(responses).includes('200') && <span style={{ color: 'rgb(74, 83, 104)', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                                200 { Object.keys(responses['200'].content).includes('application/json') && ' - application/json' }
                            </span>}
                        </div>
                        <div style={{ margin: '1rem' }} />
                        { responses['200']?.content['application/json']?.schema?.anyOf && <AnyOf name="responses" 
                            arr={responses['200'].content['application/json'].schema.anyOf}
                            lang={lang}
                            target={target}
                            onValueChange={handleMultipleResponses}
                            x_i18n={responses['200'].content['application/json'].schema["x-i18n"]} /> }
                        { responses['200']?.content['application/json']?.schema?.oneOf && <OneOf name="responses" 
                            arr={responses['200'].content['application/json'].schema.oneOf}
                            lang={lang}
                            target={target}
                            onValueChange={handleMultipleResponses}
                            x_i18n={responses['200'].content['application/json'].schema["x-i18n"]} /> }
                        { responses['200']?.content['application/json']?.schema?.type === 'object' && <Properties properties={responses['200'].content['application/json'].schema.properties} 
                            requiredFields={responses['200'].content['application/json'].schema.required}
                            lang={lang}
                            target={target} /> }
                        { responses['200']?.content['application/json']?.schema?.type === 'array' && <Items name="responses[]"
                            description= {responses['200'].content['application/json'].schema.description}
                            obj={responses['200'].content['application/json'].schema.items}
                            required={responses['200'].content['application/json'].schema.items.required}
                            lang={lang}
                            target={target} /> }
                        { responses['200']?.content['application/json']?.schema?.type !== 'object' && responses['200']?.content['application/json']?.schema?.type !== 'array' 
                         && !Object.keys(responses['200'].content['application/json'].schema).includes('anyOf') && !Object.keys(responses['200'].content['application/json'].schema).includes('oneOf') && <Primitive name="responses"
                            obj={responses['200'].content['application/json'].schema}
                            lang={lang}
                            target={target} /> }
                    </section>
                    <section className={styles.exampleContainer}>
                        { responseExample && <ExampleResponses 
                            examples={responseExample} 
                            lang={lang} 
                            target={target}
                            selectedResponse={selectedResponse} /> }
                    </section>
                </div>}
            </div>
        </>)
}

import React, { useState } from 'react';
import RestHeader from '../RestHeader';
import Admonition from '@theme/Admonition'
import CodeBlock from '@theme/CodeBlock'
import { textFilter, getBaseUrl } from './utils'
import styles from'./index.module.css';

const BaseURL = ({ endpoint, lang, target }) => {
    const { server, children, prompt } = getBaseUrl(endpoint, lang, target)
    return (<>
        <section>
            <section className={styles.sectionHeader}>
                <span>Base URL</span>
            </section>
            <div style={{margin: '1rem 0'}}>
                <p>The base URL for this API is in the following format:</p>
                <p className={styles.paramName}>{server}</p>
            </div>
            { prompt && <Admonition type="info" icon="📘" title="Notes">
                {prompt}
            </Admonition>}
        </section>
        <section className={styles.exampleContainer}>
            <CodeBlock className="language-shell" children={children} />
        </section>    
    </>)
}

const Param = ({ name, description, type, format, required, example, inProp, target }) => {
    return (
        <div className={styles.paramContainer}>
            <div class={styles.paramLabels}>
                <span className={styles.paramName}>{name}</span>
                <span className={styles.label}>{type + (format ? "\<" + format + "\>" : "")}</span>
                <span className={styles.label}>{inProp}</span>
                { required && <span className={styles.required}>required</span> }
            </div>
            <div>{textFilter(description, target)}</div>
            <div>
                { example && <div>
                    <span className={styles.paramExample}>Example Value: </span>
                    <span className={styles.label}>{example}</span>
                </div> }
            </div>
        </div>
    )
}

const Properties = ({ name, description, properties, requiredFields, required }) => {
    return (
        <>
            { name && <div className={styles.paramContainer}>
                <div class={styles.paramLabels}>
                    <span className={styles.paramName}>{name}</span>
                    <span className={styles.label}>object</span>
                    { required && <span className={styles.required}>required</span> }
                </div>
                <div>{description ? description : <i>(To be added soon)</i>}</div>
            </div> }
            <div style={{ margin: name ? '0 0 0 2rem' : '0' }}>
                { properties && Object.keys(properties).map((propName, index) => {
                    const prop = properties[propName]
                    const requireds = requiredFields instanceof Array ? requiredFields : []
                    if (prop.type === 'object') {
                        return (
                            <Properties key={index} 
                                name={propName} 
                                description={prop.description}
                                properties={prop.properties} 
                                requiredFields={prop.required} 
                                required={requireds.includes(propName)} />
                        )
                    } else if (prop.type === 'array') {
                        return (
                            <Items key={index} name={propName} description={prop.description} obj={prop} required={requireds.includes(propName)} />
                        )
                    } else if (prop?.anyOf) {
                        return (
                            <AnyOf key={index} name={propName} description={prop.description} arr={prop.anyOf} required={requireds.includes(propName)} />
                        )
                    } else if (prop?.oneOf) {
                        return (
                            <OneOf key={index} name={propName} description={prop.description} arr={prop.oneOf} required={requireds.includes(propName)} />
                        )
                    } else {
                        return (
                            <Primitive key={index} name={propName} obj={prop} required={requireds.includes(propName)} />
                        )
                    }
                }) } 
            </div>
       
        </>
    )
}

const Items = ({ name, description, obj, required }) => {
    return (
        <>
            { name && <div className={styles.paramContainer}>
                <div class={styles.paramLabels}>
                    <span className={styles.paramName}>{name}</span>
                    <span className={styles.label}>array</span>
                    { required && <span className={styles.required}>required</span> }
                </div>
                <div>{description ? description : <i>(To be added soon)</i>}</div>
            </div> }
            <div style={{ margin: name ? '0 0 0 2rem' : '0' }}>
                { Object.keys(obj.items).includes('anyOf') && <AnyOf name={`${name}[]`} description={obj.items.description}
                    arr={obj.items.anyOf} required={obj.items.required} /> }  
                { Object.keys(obj.items).includes('oneOf') && <OneOf name={`${name}[]`} description={obj.items.description}
                    arr={obj.items.oneOf} required={obj.items.required} /> }
                { obj.items.type === 'object' && <Properties name={`${name}[]`} 
                    description= {obj.items.description}
                    properties={obj.items.properties} 
                    requiredFields={obj.items.required} 
                    required={required} /> }
                { obj.items.type === 'array' && <Items name={`${name}[]`}
                    description= {obj.items.description}
                    obj={obj.items.items}
                    required={obj.items.items.required}  />}
                { obj.items.type !== 'object' && obj.items.type !== 'array' 
                && !Object.keys(obj.items).includes('anyOf') && !Object.keys(obj.items).includes('oneOf') && <Primitive name={`${name}[]`}
                    obj={obj.items} 
                    required={obj.items.required}/>}
            </div>
        </>
    )
}

const Primitive = ({ name, obj, required }) => {
    const { type, description, format, minimum, maximum, defaultValue} = obj;
    const enums = obj.enum ? obj.enum : []

    return (
        <div className={styles.paramContainer}>
            <div class={styles.paramLabels}>
                <span className={styles.paramName}>{name}</span>
                <span className={styles.label}>{type}</span>
                { required && <span className={styles.required}>required</span> }
                { format && <span className={styles.label}>{format}</span> }
            </div>
            <div>{description ? description : <i>(To be added soon)</i>}</div>
            <div>
                { (minimum || maximum) && <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className={styles.paramExample}>Value Range: </span>
                    { minimum &&<span className={styles.label}> &ge; {minimum}</span>}
                    { maximum &&<span className={styles.label}> &le; {maximum}</span>}
                </div> }
                { enums.length > 0 && <Enums enums={enums} defaultValue={defaultValue} /> }
                { defaultValue && <div>
                    <span className={styles.paramExample}>Default Value: </span>
                    <span className={styles.label}>{defaultValue}</span>
                </div> }
            </div>
        </div>
    )
}

const Enums = ({ enums, defaultValue }) => {
    const [ enumItem, setEnumItem ] = useState(defaultValue ? defaultValue : enums[0])

    const handleEnumChange = (e) => {
        setEnumItem(e.target.value)
    }

    return (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', alignItems: 'center' }}>
            <label for="enumSelect" className={styles.paramExample}>Possible Values:</label>
            <div>
                <select id="enumSelect" value={enumItem} onChange={handleEnumChange}>
                    {enums.map((enumValue, index) => {
                        return (
                            <option key={index} value={enumValue}>{enumValue}</option>
                        )
                    })}
                </select>
            </div>
        </div>
    )
}

const Tab = ({ name, id, content }) => {
    const [isChecked, setIsChecked] = useState(id === 1)

    const handleClick = () => {
        setIsChecked(!isChecked)
    }

    return (
        <>
            <input 
                name={name} 
                type="radio" 
                id={`tab${id}`} 
                checked={isChecked}
                onChange={ e=> {} } />
            <label className={styles.tabLabel} htmlFor={`tab${id}`} onClick={handleClick}>{ content.label ? content.label : `Option ${id}` }</label>
            <div className={styles.tabPanel}>
                { content?.type === 'object' && <Properties properties={content.properties} requiredFields={content.required} /> }
                { content?.type === 'code' && <CodeBlock className="language-json" children={JSON.stringify(content.value, null, 2)} /> }
            </div>
        </>
    )
}

const AnyOf = ({ name, description, arr, required }) => {
    return (<>
        { (name && name !== 'responses' && name !== 'requestBody') && <div className={styles.paramContainer}>
            <div class={styles.paramLabels}>
                <span className={styles.paramName}>{name}</span>
                <span className={styles.label}>anyOf</span>
                { required && <span className={styles.required}>required</span> }
            </div>
            <div>{description ? description : <i>(To be added soon)</i>}</div>
        </div> }
        <div style={{ margin: (name && name !== 'responses' && name !== 'requestBody') ? '0 0 0 2rem' : '0' }}>
            <div className={styles.tabs} style={{ marginTop: '1rem' }}>
                {arr.map((item, index) => {
                    return (
                        <Tab key={index} name={name} id={index+1} content={item} />
                    )
                })}
            </div>
        </div>
    </>)
}

const OneOf = ({ name, description, arr, required }) => {
    return (<>
        { (name && name !== 'responses' && name !== 'requestBody') && <div className={styles.paramContainer}>
            <div class={styles.paramLabels}>
                <span className={styles.paramName}>{name}</span>
                <span className={styles.label}>oneOf</span>
                { required && <span className={styles.required}>required</span> }
            </div>
            <div>{description ? description : <i>(To be added soon)</i>}</div>
        </div> }
        <div style={{ margin: (name && name !== 'responses' && name !== 'requestBody') ? '0 0 0 2rem' : '0' }}>
            <div className={styles.tabs} style={{ marginTop: '1rem' }}>
                {arr.map((item, index) => {
                    return (
                        <Tab key={index} name={name} id={index+1} content={item} />
                    )
                })}
            </div>
        </div>
    </>)
}

const ExampleResponses = ({ examples }) => {
    return (
        <div className={styles.tabs} style={{ marginTop: '1rem' }}>
            {Object.keys(examples).map((key) => {
                return (
                    <Tab key={key} name="resExamples" id={parseInt(key)} content={{ type: 'code', label: examples[key].summary, value: examples[key].value }} />
                )
            })}
        </div>
    )

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
    const endpoint = props.endpoint.replace('{', '${').replace('}', '}')

    const short = description
    const headerParams = parameters ? parameters.filter(param => param.in === 'header') : []
    const headersExample = headerParams.map(param => `-H "${param.name}": "${param.example}"`).join('\n').replace(/{{/g, '${').replace(/}}/g, '}')
    const pathParams = parameters ? parameters.filter(param => param.in === 'path') : []
    const queryParams = parameters ? parameters.filter(param => param.in === 'query') : []
    const queryExample = queryParams.map(param => `${param.name}=${param.example}`).join('&')
    const requestExample = requestBody?.content['application/json']?.example
    const responseExample = responses?.['200']?.content['application/json']?.examples
    
    const condition = (endpoint.includes('cloud') || endpoint.includes('cluster') || endpoint.includes('import') || endpoint.includes('pipeline')) || endpoint.includes('project') || endpoint.includes('metrics')
    const token = condition ? 'YOUR_API_KEY' : "db_admin:xxxxxxxxxxxxx"
    var req = `export TOKEN="${token}"\n\ncurl -X ${props.method.toUpperCase()} \${BASE_URL}${props.endpoint}`
    req = queryExample ? `${req}?${queryExample}` : req
    req = headersExample ? `${req}\n${headersExample}\n-H "Content-Type: application/json"` : req
    req = requestExample ? `${req}\n-d '${JSON.stringify(requestExample, null, 2)}'` : req

    return (
        <>
            <div>
                <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '60% 40%' }}>
                    <div>
                        <p>{ short }</p>
                        <RestHeader 
                            method={props.method}
                            endpoint={props.endpoint}
                        />
                    </div>
                </div>
                <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '60% 40%' }}>
                    <BaseURL endpoint={props.endpoint} lang={lang} target={target} />
                    { (parameters.length > 0 || requestBody) && <>
                        <section>
                            { parameters.length > 0 && <section>
                                <div className={styles.sectionHeader}>
                                    <span>Parameters</span>
                                </div>
                                { headerParams.length > 0 && headerParams.map((param, index) => {
                                    return (
                                        <Param 
                                            key={index} 
                                            target={target} 
                                            name={param.name} 
                                            description={ param.i18n?.[lang]?.description ? param.i18n[lang].description : param.description } 
                                            type={param.schema.type} 
                                            required={param.required} 
                                            example={param.example}
                                            inProp={param.in} />
                                    )
                                })}
                                { pathParams.length > 0 && pathParams.map((param, index) => {
                                    return (
                                        <Param 
                                            key={index} 
                                            target={target} 
                                            name={param.name} 
                                            description={ param.i18n?.[lang]?.description ? param.i18n[lang].description : param.description } 
                                            type={param.schema.type}
                                            required={param.required} 
                                            example={param.example}
                                            inProp={param.in} />
                                    )
                                })}
                                { queryParams.length > 0 && queryParams.map((param, index) => {
                                    return (
                                        <Param 
                                            key={index} 
                                            target={target} 
                                            name={param.name} 
                                            description={ param.i18n?.[lang]?.description ? param.i18n[lang].description : param.description } 
                                            type={param.schema.type}
                                            required={param.required} 
                                            example={param.example}
                                            inProp={param.in} />
                                    )
                                })}
                            </section>}
                            { requestBody && <section>
                                <section>
                                    <div className={styles.sectionHeader} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <span>Request Body</span>
                                        { Object.keys(requestBody.content).includes('application/json') && <span style={{ color: 'rgb(74, 83, 104)', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                                            application/json</span>}
                                    </div>
                                    <div style={{ margin: '1rem' }} />
                                    { requestBody.content['application/json']?.schema?.type === 'object' && <Properties properties={requestBody.content['application/json'].schema.properties} 
                                        requiredFields={requestBody.content['application/json'].schema.required} /> }
                                    { requestBody.content['application/json']?.schema?.type === 'array' && <Items name="requestBody[]"
                                        description= {requestBody.content['application/json'].schema.description}
                                        obj={requestBody.content['application/json'].schema.items}
                                        required={requestBody.content['application/json'].schema.items.required} /> }
                                    { requestBody.content['application/json']?.schema?.anyOf && <AnyOf name="requestBody"
                                        arr={requestBody.content['application/json'].schema.anyOf} /> }
                                    { requestBody.content['application/json']?.schema?.oneOf && <OneOf name="requestBody"
                                        arr={requestBody.content['application/json'].schema.oneOf} /> }
                                    { requestBody.content['application/json']?.schema?.type !== 'object' && requestBody.content['application/json']?.schema?.type !== 'array' 
                                     && !Object.keys(requestBody.content['application/json'].schema).includes('anyOf') && !Object.keys(requestBody.content['application/json'].schema).includes('oneOf') && <Primitive name="requestBody"
                                        obj={requestBody.content['application/json'].schema} /> }
                                </section>
                            </section>}
                        </section>
                        <section className={styles.exampleContainer}>
                            <CodeBlock className="language-bash" children={ req } />
                        </section>
                    </>}
                </div>
                
                { responses && <div  style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '60% 40%' }}>
                    <section>
                        <div className={styles.sectionHeader} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                            <span>Responses</span>
                            { Object.keys(responses).includes('200') && <span style={{ color: 'rgb(74, 83, 104)', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                                200 { Object.keys(responses['200'].content).includes('application/json') && ' - application/json' }
                            </span>}
                        </div>
                        <div style={{ margin: '1rem' }} />
                        { responses['200']?.content['application/json']?.schema?.anyOf && <AnyOf name="responses" arr={responses['200'].content['application/json'].schema.anyOf} /> }
                        { responses['200']?.content['application/json']?.schema?.oneOf && <OneOf name="responses" arr={responses['200'].content['application/json'].schema.oneOf} /> }
                        { responses['200']?.content['application/json']?.schema?.type === 'object' && <Properties properties={responses['200'].content['application/json'].schema.properties} 
                            requiredFields={responses['200'].content['application/json'].schema.required} /> }
                        { responses['200']?.content['application/json']?.schema?.type === 'array' && <Items name="responses[]"
                            description= {responses['200'].content['application/json'].schema.description}
                            obj={responses['200'].content['application/json'].schema.items}
                            required={responses['200'].content['application/json'].schema.items.required} /> }
                        { responses['200']?.content['application/json']?.schema?.type !== 'object' && responses['200']?.content['application/json']?.schema?.type !== 'array' 
                         && !Object.keys(responses['200'].content['application/json'].schema).includes('anyOf') && !Object.keys(responses['200'].content['application/json'].schema).includes('oneOf') && <Primitive name="responses"
                            obj={responses['200'].content['application/json'].schema} /> }
                    </section>
                    <section className={styles.exampleContainer}>
                        { responseExample && <ExampleResponses examples={responseExample} /> }
                    </section>
                </div>}
            </div>
        </>)
}
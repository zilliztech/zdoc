const cheerio = require('cheerio')

const regex = /<(include|exclude) target="(\b(\w+,)*\w+\b)">/g
const regex2 = /<(include|exclude) target="(\b(\w+,)*\w+\b)">[\s\S]*?<\/\1>/g

var test = `
<include target="zilliz"><include target="paas">

paas<include target="paas">paas</include>sdfdasfsd<include target="saas">saas</include>
<include target="saas">

saassaas
</include>
    sdfdasfads
    <exclude target="paas">
    paas
    </exclude>
paas
</include>

<include target="saas">

saas
</include>

</include>
`



const targets = ['zilliz', 'paas']

const $ = cheerio.load(test)

for (let target of targets) {
    const elements = $('include, exclude')

    for (let element of elements) {
        if (element.name === 'include' && targets.includes($(element).attr('target'))) {
            console.log(target, element.name, element.attribs.target, 1)
            const raw = $(element).toString()
            const innerHTML = $(element).html()
            test = test.replace(raw, innerHTML)
        }
    
        if (element.name === 'include' && !targets.includes($(element).attr('target'))) {
            console.log(target, element.name, element.attribs.target, 2)
            const raw = $(element).toString()
            
            if (targets.indexOf(target) === targets.length - 1) {
                test = test.replace(raw, '')
            }
        }
    
        if (element.name === 'exclude' && targets.includes($(element).attr('target'))) {
            console.log(target, element.name, element.attribs.target, 3)
            const raw = $(element).toString()
            test = test.replace(raw, '')
        }
    
        if (element.name === 'exclude' && !targets.includes($(element).attr('target'))) {
            console.log(target, element.name, element.attribs.target, 4)
            const raw = $(element).toString()
            const innerHTML = $(element).html()
    
            if (targets.indexOf(target) === targets.length - 1) {
                test = test.replace(raw, innerHTML)
            }
        }   
    }

    test = test.replace(/(\s*\n){3,}/g, '\n\n').replace(/(<br\/>){2,}/, "<br/>").replace(/<br>/g, '<br/>');
}



console.log(test)
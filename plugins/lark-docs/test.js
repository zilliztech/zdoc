const fs = require('fs')
const cheerio = require('cheerio')
const { parse } = require('node-html-parser')

var test = fs.readFileSync('test.md', 'utf8')

const targets = ['zilliz', 'paas']

const $ = cheerio.load(test)

const root = parse(test)

root.querySelectorAll('include, exclude').forEach(element => {
    console.log(element)
})

// for (let target of targets) {
//     const elements = $('include, exclude')

//     for (let element of elements) {
//         const raw = $(element).toString()
//         const innerHTML = $(element).html()

//         console.log(test.indexOf(raw))

//         if (element.name === 'include' && targets.includes($(element).attr('target'))) {
//             console.log(target, element.name, element.attribs.target, 1)
//             test = test.replace(raw, innerHTML)
//         }
    
//         if (element.name === 'include' && !targets.includes($(element).attr('target'))) {
//             console.log(target, element.name, element.attribs.target, 2)
            
//             if (targets.indexOf(target) === targets.length - 1) {
//                 test = test.replace(raw, '')
//             }
//         }
    
//         if (element.name === 'exclude' && targets.includes($(element).attr('target'))) {
//             console.log(target, element.name, element.attribs.target, 3)
//             test = test.replace(raw, innerHTML)
//         }
    
//         if (element.name === 'exclude' && !targets.includes($(element).attr('target'))) {
//             console.log(target, element.name, element.attribs.target, 4)
//             const innerHTML = $(element).html()
    
//             if (targets.indexOf(target) === targets.length - 1) {
//                 test = test.replace(raw, '')
//             }
//         }   
//     }

//     test = test.replace(/(\s*\n){3,}/g, '\n\n').replace(/(<br\/>){2,}/, "<br/>").replace(/<br>/g, '<br/>');
// }



// console.log(test)
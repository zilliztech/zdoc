const regex1 = /<(include|exclude) target="(\b(\w+,)*\w+\b)">/g
const regex2 = /<\/(include|exclude)>/
const regex3 = /<(include|exclude) target="(\b(\w+,)*\w+\b)">[\s\S]*?<\/\1>/g

const test = `
<include target="zilliz">

asdlkjfla;fja;'ds<include target="paas">asdfasdfasdfdsa</include>
<include target="saas">

asdfasdfdasf
</include>
    sdfdasfads
    <exclude target="paas">
    adfasdfdas
    </exclude>
adfasdfads

<include target="saas">

adsfdasfkjijpijlajdf
</include>

</include>
`
var pairs = []
var current = ""
var currentIdx = 0
var closeTag = ""
var closeTagIdx = 0
const lines = test.split("\n")

// for (const line of lines) {
//     var matches = [... line.matchAll(regex1)]

//     if (matches.length > 0) {
//         var tag = matches[0][1]
//         current = line
//         currentIdx = line.indexOf(matches[0][0])
//         closeTag = `</${tag}>`
//     } else if (line.includes(regex2)) {

//     } else if (line.matchAll(regex3)) {
//         // check the tag and target
//     }
// }

lines.forEach((line, idx) => {
    var matches = [... line.matchAll(regex1)]

    if (matches.length > 0) {
        var tag = matches[0][1]
        current = line
        currentIdx = idx
        closeTag = 
    } else if (line.match(regex2)) {
        var tag =
    }
})
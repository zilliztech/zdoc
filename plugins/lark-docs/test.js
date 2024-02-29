const regex = /<(include|exclude) target="(\b(\w+,)*\w+\b)">/g

const test = `
<include target="zilliz">

asdlkjfla;fja;'ds
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

const matches = [... test.matchAll(regex)]
var current = ""

for (const match of matches) {
    
}
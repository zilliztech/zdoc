const fs = require('fs');
const RefGen = require('./refGen');

const specs = JSON.parse(fs.readFileSync('meta/clean.json', 'utf8'));

const search = specs.paths["/v2/vectordb/entities/search"].post.requestBody.content["application/json"].schema

const gen = new RefGen({
    specifications: specs,
    lang: "en",
    target_path: "",
    strings: ""

})

console.log(gen.req_format(search))


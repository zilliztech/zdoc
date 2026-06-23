const assert = require('node:assert/strict')
const fs = require('node:fs')
const Module = require('node:module')
const path = require('node:path')
const babel = require('@babel/core')

function loadUtils() {
    const filename = path.join(__dirname, 'utils.js')
    const source = fs.readFileSync(filename, 'utf8')
    const { code } = babel.transformSync(source, {
        filename,
        presets: [
            ['@babel/preset-env', { targets: { node: 'current' } }],
        ],
    })
    const mod = new Module(filename, module)
    mod.filename = filename
    mod.paths = Module._nodeModulePaths(__dirname)
    mod._compile(code, filename)
    return mod.exports
}

function testFilterSchemaOptionsByLanguageKeepsOriginalOptionValues() {
    const { filterSchemaOptions } = loadUtils()
    const options = [
        { label: 'AWS S3', 'x-target-lang': 'en-US' },
        { label: 'GCP GCS', 'x-target-lang': 'en-US' },
        { label: 'Alibaba Cloud OSS', 'x-target-lang': 'zh-CN' },
        { label: 'failure' },
    ]

    assert.deepEqual(
        filterSchemaOptions(options, 'en-US').map(({ item, originalIndex }) => ({
            label: item.label,
            originalIndex,
        })),
        [
            { label: 'AWS S3', originalIndex: 0 },
            { label: 'GCP GCS', originalIndex: 1 },
            { label: 'failure', originalIndex: 3 },
        ],
    )
}

function testFilterSchemaOptionsLeavesUntargetedOptionsForAllLanguages() {
    const { filterSchemaOptions } = loadUtils()
    const options = [
        { label: 'AWS S3', 'x-target-lang': 'en-US' },
        { label: 'failure' },
    ]

    assert.deepEqual(
        filterSchemaOptions(options, 'zh-CN').map(({ item, originalIndex }) => ({
            label: item.label,
            originalIndex,
        })),
        [
            { label: 'failure', originalIndex: 1 },
        ],
    )
}

function testGetExampleLabelFallsBackToTabLabelAndOption() {
    const { getExampleLabel } = loadUtils()

    assert.equal(getExampleLabel({ summary: 'AWS S3', 'x-tab-label': 'ignored' }, '1'), 'AWS S3')
    assert.equal(getExampleLabel({ 'x-tab-label': 'GCP GCS' }, '2'), 'GCP GCS')
    assert.equal(getExampleLabel({}, '3'), 'OPTION 3')
}

testFilterSchemaOptionsByLanguageKeepsOriginalOptionValues()
testFilterSchemaOptionsLeavesUntargetedOptionsForAllLanguages()
testGetExampleLabelFallsBackToTabLabelAndOption()
console.log('restspecs utils tests passed')

const test = require('node:test')
const assert = require('node:assert/strict')
const {apiProjection, resolveSchemaDeep, mergeMirrorProse, droppedLocalFieldPaths, droppedLocalKeys, stripScalarConstraints, mirrorValueMatches, assertMirrorValueBound, proseNodes, isTranslationComplete, assertSchemaShape} = require('./mirror')

test('apiProjection strips doc-owned keys at every depth and keeps API truth', () => {
    const schema = {
        description: 'local text', 'x-i18n': {'zh-CN': {description: '中'}}, example: 1,
        type: 'object', required: ['a'], maxLength: 5,
        properties: {a: {type: 'string', description: 'inner', minLength: 2}},
    }
    assert.deepEqual(apiProjection(schema), {
        type: 'object', required: ['a'], maxLength: 5,
        properties: {a: {type: 'string', minLength: 2}},
    })
})

test('resolveSchemaDeep inlines refs and allOf merges; cycles fail closed', () => {
    const document = {components: {schemas: {
        Dto: {type: 'object', properties: {id: {type: 'string'}}, required: ['id']},
        Base: {type: 'object', properties: {base: {type: 'string'}}},
    }}}
    const resolved = resolveSchemaDeep(document, {$ref: '#/components/schemas/Dto'})
    assert.deepEqual(resolved, {type: 'object', properties: {id: {type: 'string'}}, required: ['id']})
    const merged = resolveSchemaDeep(document, {allOf: [{$ref: '#/components/schemas/Base'}], type: 'object', properties: {own: {type: 'integer'}}})
    assert.deepEqual(merged.properties, {base: {type: 'string'}, own: {type: 'integer'}})
    // a cycle through structure keys recurses until the depth guard fires
    const cyclic = {components: {schemas: {Loop: {type: 'object', properties: {self: {$ref: '#/components/schemas/Loop'}}}}}}
    assert.throws(() => resolveSchemaDeep(cyclic, {$ref: '#/components/schemas/Loop'}), /REST_UPSTREAM_MIRROR_REF_CYCLE/)
    assert.throws(() => resolveSchemaDeep(document, {$ref: '#/components/schemas/Missing'}), /REST_UPSTREAM_MIRROR_REF_DANGLING/)
})

test('mergeMirrorProse keeps local prose/x-* at surviving nodes and adopts upstream structure', () => {
    const upstream = {type: 'object', properties: {
        jobId: {type: 'string', description: 'upstream text'},
        added: {type: 'string', description: 'new field'},
    }}
    const local = {type: 'array', items: {}, properties: {
        jobId: {type: 'string', maxLength: 64, description: 'rich local text', 'x-i18n': {'zh-CN': {description: '本地'}, 'ja-JP': {description: 'ローカル'}}},
        retired: {type: 'string'},
    }, 'x-admonition': 'local note'}
    const merged = mergeMirrorProse(upstream, local)
    assert.deepEqual(merged, {type: 'object', 'x-admonition': 'local note', properties: {
        jobId: {type: 'string', description: 'rich local text', 'x-i18n': {'zh-CN': {description: '本地'}, 'ja-JP': {description: 'ローカル'}}},
        added: {type: 'string', description: 'new field'},
    }})
    // branch members match by x-tab-label first
    const upstreamBranched = {oneOf: [
        {'x-tab-label': 'success', type: 'object', properties: {code: {type: 'integer'}}},
        {'x-tab-label': 'failure', type: 'object'},
    ]}
    const localBranched = {oneOf: [
        {'x-tab-label': 'failure', description: 'local failure'},
        {'x-tab-label': 'success', description: 'local success'},
    ]}
    const mergedBranched = mergeMirrorProse(upstreamBranched, localBranched)
    assert.equal(mergedBranched.oneOf[0].description, 'local success')
    assert.equal(mergedBranched.oneOf[1].description, 'local failure')
})

test('droppedLocalFieldPaths and droppedLocalKeys name what a mirror retires', () => {
    const upstream = {type: 'object', properties: {kept: {type: 'string'}, gone: {type: 'string'}}}
    const local = {type: 'object', properties: {
        kept: {type: 'string', maxLength: 3},
        gone: {type: 'string'},
        extra: {type: 'object', properties: {deep: {type: 'string'}}},
    }}
    assert.deepEqual(droppedLocalFieldPaths(upstream, local), ['extra'])
    assert.deepEqual(droppedLocalKeys(upstream, local), ['kept(maxLength)'])
    // structure-only comparison strips those scalar keys, so nothing triggers
    assert.deepEqual(stripScalarConstraints(local).properties.kept, {type: 'string'})
})

test('mirrorValueMatches tolerates exactly the translation overlay and nothing else', () => {
    const expected = {type: 'object', properties: {name: {type: 'string', description: 'Name.'}}}
    const overlay = {type: 'object', properties: {name: {type: 'string', description: 'Name.',
        'x-i18n': {'zh-CN': {description: '名'}, 'ja-JP': {description: '名前'}}}}}
    assert.equal(mirrorValueMatches(expected, overlay), true)
    // no description on the node -> no overlay allowed
    const noDesc = {type: 'object', properties: {id: {type: 'string'}}}
    assert.equal(mirrorValueMatches(noDesc, {type: 'object', properties: {id: {type: 'string', 'x-i18n': {'zh-CN': {description: 'x'}, 'ja-JP': {description: 'y'}}}}}), false)
    // changed constraints are never tolerated
    assert.equal(mirrorValueMatches(expected, structuredClone({...overlay, properties: {...overlay.properties, name: {...overlay.properties.name, maxLength: 9}}})), false)
    const cited = {change: {after: {type: 'object', properties: {name: {type: 'string', description: 'Name.'}}}}}
    const bound = assertMirrorValueBound({diffEntryId: 'x', value: expected}, cited, {type: 'object', properties: {name: {type: 'string', maxLength: 9}}})
    assert.deepEqual(bound, expected)
    assert.throws(() => assertMirrorValueBound({diffEntryId: 'x', value: {type: 'object'}}, cited,
        {type: 'object', properties: {name: {type: 'string', maxLength: 9}}}), /REST_UPSTREAM_APPLY_VALUE_UNBOUND/)
})


test('mirrorValueMatches recurses arrays: overlays inside oneOf/items are tolerated', () => {
    // the P1-1 deadlock: translate writes x-i18n on oneOf members too
    const expected = {type: 'object', oneOf: [
        {'x-tab-label': 'success', type: 'object', properties: {code: {type: 'integer', description: 'Code.'}}},
        {'x-tab-label': 'error', type: 'object'},
    ]}
    const overlaid = {type: 'object', oneOf: [
        {'x-tab-label': 'success', type: 'object', properties: {code: {type: 'integer', description: 'Code.',
            'x-i18n': {'zh-CN': {description: '码'}, 'ja-JP': {description: 'コード'}}}}},
        {'x-tab-label': 'error', type: 'object'},
    ]}
    assert.equal(mirrorValueMatches(expected, overlaid), true)
    // existing upstream zh preserved byte-identically, ja added on top
    const withZh = {type: 'object', items: {type: 'string', description: 'x', 'x-i18n': {'zh-CN': {description: '中'}}}}
    const withZhJa = {type: 'object', items: {type: 'string', description: 'x', 'x-i18n': {'zh-CN': {description: '中'}, 'ja-JP': {description: 'ヤ'}}}}
    assert.equal(mirrorValueMatches(withZh, withZhJa), true)
    // changed structure inside an array member is still refused
    const mutated = JSON.parse(JSON.stringify(overlaid))
    mutated.oneOf[0].properties.code.type = 'string'
    assert.equal(mirrorValueMatches(expected, mutated), false)
    assert.equal(mirrorValueMatches(expected, {type: 'object', oneOf: [overlaid.oneOf[0]]}), false)
})

test('mergeMirrorProse preserves local scalar constraints only in preserve mode', () => {
    const upstream = {type: 'object', properties: {limit: {type: 'integer', description: 'keep'}}}
    const local = {type: 'object', properties: {limit: {type: 'integer', maximum: 64, description: 'local keep'}}}
    const preserved = mergeMirrorProse(upstream, local, {preserveLocalScalarConstraints: true})
    assert.equal(preserved.properties.limit.maximum, 64)
    const plain = mergeMirrorProse(upstream, local)
    assert.equal(plain.properties.limit.maximum, undefined)
})

test('proseNodes never descends into x-i18n; completeness needs both locales', () => {
    const value = {type: 'object', properties: {
        a: {type: 'string', description: 'one'},
        b: {type: 'string', description: 'two', 'x-i18n': {'zh-CN': {description: '二'}, 'ja-JP': {description: '二'}}},
    }}
    assert.equal(proseNodes(value).length, 2)
    assert.equal(isTranslationComplete(value), false)
    assert.equal(isTranslationComplete(mergeMirrorProse(value, {})), false)
})

test('assertSchemaShape refuses the PR #964 monster classes', () => {
    assert.throws(() => assertSchemaShape({type: 'object', items: {type: 'string'}}, 't'), /type object but carries items/)
    assert.throws(() => assertSchemaShape({type: 'array', properties: {}}, 't'), /type array but carries properties/)
    assert.throws(() => assertSchemaShape({type: 'string', properties: {}}, 't'), /scalar string but carries properties/)
    assert.throws(() => assertSchemaShape({type: 'integer', items: {}}, 't'), /scalar integer but carries items/)
    assert.doesNotThrow(() => assertSchemaShape({type: 'array', items: {type: 'object', properties: {a: {type: 'string'}}}}, 't'))
    assert.doesNotThrow(() => assertSchemaShape({type: 'object', properties: {a: {type: 'array', items: {type: 'string'}}}}, 't'))
})

const larkUtils = require('./larkUtils');

const utils = new larkUtils();
const outputDir = 'milvus/guides/docs/get-started'
const docsourceDir = ''

utils.postprocess_for_milvus(outputDir, docsourceDir)
const larkUtils = require('./larkUtils');

const utils = new larkUtils();
const outputDir = 'milvus/reference/python/docs/MilvusClient/MilvusClient-Client'
const docsourceDir = ''

utils.postprocess_for_milvus(outputDir, docsourceDir)
const assert = require('node:assert/strict');

async function testSlugifyRejectsAmbiguousTitleFallback() {
  const larkDocScraper = require('./larkDocScraper');
  const scraper = new larkDocScraper('', '', 'wiki', '/tmp');

  scraper.slugs = {
    N44ndTSrgoEBx7xCID5cXRS7n1c: {
      slug: 'utility-create_user',
      title: 'create_user()',
    },
    BDupd28JqoNY9HxVOTfcv86enRe: {
      slug: 'Authentication-create_user',
      title: 'create_user()',
    },
  };

  await assert.rejects(
    () => scraper.__slugify('EglSdm1jkozDSlxq6SEc4CRonVe', 'create_user()'),
    /Ambiguous slug metadata/
  );
}

async function run() {
  await testSlugifyRejectsAmbiguousTitleFallback();
  console.log('lark-docs scraper tests passed');
}

run();

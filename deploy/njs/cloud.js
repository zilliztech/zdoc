// Request-time cloud-data fragment renderer for nginx njs (js_content).
//
// The `.md` artifacts carry SSI pairs baked by embed-markdown:
//   <!--# block name="…" -->(snapshot table)<!--# endblock -->
//   <!--# include virtual="/api/cloud-data/fragment.md?section=…&site=…" stub="…" -->
// nginx resolves the include here: subrequest the CMS JSON through the
// caching /api/cloud-json/ locations, adapt and render it with the SAME
// modules the build used (packages/docs-ui/src/shared/cloud-data), and serve
// text/markdown. Any failure returns an empty 200 so SSI falls back to the
// snapshot stub — the documented CMS-outage degradation.
//
// Site selection rides the include URL (`&site=en|zh-CN`) because the same
// image serves both sites and njs cannot read environment variables. The four
// hard constraints verified in ssi-local-test are encoded in the site confs:
// buffer >= JSON size, one proxy_pass hop before this location (an njs
// location cannot be an SSI include target directly), intercepted upstream
// errors, and the stub block preceding the include.

// njs only supports default imports; the core modules ship matching defaults.
import fs from 'fs';

import adapter from 'adapter.js';
import render from 'render.js';

const SNAPSHOT_DIR = '/etc/nginx/njs/snapshots/';

// Degradation tier 1: render the committed snapshot that ships in the image.
// The include must keep returning real content — an empty 200 would push nginx
// into the SSI stub path, which has a rare race where the stub block is
// emitted twice when the empty response completes during the final output
// flush (observed on CI with the single-render harness assertion).
function renderFromSnapshot(site, section, provider) {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_DIR + site + '.json', 'utf8'));
  if (snapshot.site !== site) throw new Error('snapshot site mismatch: ' + snapshot.site);
  return render.renderFragment(snapshot.model, {section: section, provider: provider});
}

async function fragment(r) {
  const site = r.args.site === 'zh-CN' ? 'zh-CN' : 'en';
  const section = r.args.section;
  const provider = r.args.provider || undefined;
  try {
    if (!section) throw new Error('missing section argument');

    const regionsResponse = await r.subrequest('/api/cloud-json/regions');
    if (regionsResponse.status !== 200) throw new Error('regions upstream ' + regionsResponse.status);
    let featuresJson = {data: []};
    if (section === 'features') {
      const featuresResponse = await r.subrequest('/api/cloud-json/features');
      if (featuresResponse.status !== 200) throw new Error('features upstream ' + featuresResponse.status);
      featuresJson = JSON.parse(featuresResponse.responseText);
    }
    const regionsJson = JSON.parse(regionsResponse.responseText);

    const model = adapter.buildModel(site, regionsJson, featuresJson);
    const markdown = render.renderFragment(model, {section: section, provider: provider});

    r.headersOut['Content-Type'] = 'text/markdown; charset=utf-8';
    r.return(200, markdown);
  } catch (liveError) {
    try {
      const fallback = renderFromSnapshot(site, section, provider);
      r.headersOut['Content-Type'] = 'text/markdown; charset=utf-8';
      r.return(200, fallback);
    } catch (fallbackError) {
      // Degradation tier 2 (snapshot missing/corrupt): empty 200 so SSI uses
      // the baked stub block. Reachable only when the image itself is broken.
      r.error('cloud-data fragment failed: ' + liveError + '; snapshot fallback failed: ' + fallbackError);
      r.return(200, '');
    }
  }
}

export default {fragment};

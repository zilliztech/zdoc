// Table strings for the cloud-data fragments, per locale. These must stay in
// lockstep with the wording of the live pages (render.js of the
// 2026-10-26-regionmatrix-markdown-template research verified them verbatim).
//
// Japanese has no CMS data (ja-JP instance is empty, §6-5): the English site's
// ja-JP pages resolve to the English strings and English data until the CMS
// records Japanese content.
//
// njs-compatible ESM (see vocab.js): no optional chaining/nullish/Map.

const STRINGS = {
  en: {
    all: '✅ All listed regions',
    none: 'Not available',
    partial: 'ℹ️ Part of the regions:',
    contact: 'ℹ️ Contact us',
    plus: function (text) { return 'Plus ' + text; },
    noteTitle: 'Note',
    regionColumns: ['Continent', 'Region', 'Location'],
    ipColumns: ['Region', 'Location', 'IP Addresses (CIDR)'],
  },
  'zh-CN': {
    all: '✅ 全部地域',
    none: '暂不支持',
    partial: 'ℹ️ 部分地域：',
    contact: 'ℹ️ 请联系我们',
    plus: function (text) { return '另加 ' + text; },
    noteTitle: '说明',
    regionColumns: ['大洲', '地域名称', '位置'],
    ipColumns: ['云地域', '位置', 'IP 地址（CIDR）'],
  },
};

function stringsFor(locale) {
  return STRINGS[locale] || STRINGS.en;
}

// njs only supports default imports (see vocab.js).
export default {STRINGS, stringsFor};

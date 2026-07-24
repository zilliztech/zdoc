/**
 * Tag the first *logical* column of grouped (rowspan) markdown tables as row
 * headers, so CSS can bold them — including single-row group labels that aren't
 * authored as rowspan cells (which a position-only CSS rule can't distinguish from
 * data that gets shifted into column 0 by a rowspan above it).
 *
 * It builds a virtual grid accounting for rowspan/colspan and tags every <td>
 * whose computed grid column is 0.
 */
function tagTableRowHeaders() {
  if (typeof document === 'undefined') return;
  const tables = document.querySelectorAll('.markdown table');
  tables.forEach((table) => {
    // only complex grouped tables (a position rule already covers simple ones)
    if (!table.querySelector('td[rowspan]')) return;
    const rows = table.rows;
    table.querySelectorAll('.zd-rowspan-ends-at-table-bottom').forEach((cell) => {
      cell.classList.remove('zd-rowspan-ends-at-table-bottom');
    });
    const occupied = []; // occupied[r][c] = true when covered by a span
    for (let r = 0; r < rows.length; r++) {
      const cells = rows[r].cells;
      let col = 0;
      for (let i = 0; i < cells.length; i++) {
        while (occupied[r] && occupied[r][col]) col++;
        const cell = cells[i];
        const rs = cell.rowSpan || 1;
        const cs = cell.colSpan || 1;
        if (col === 0 && cell.tagName === 'TD') {
          cell.classList.add('zd-rowgroup-head');
        }
        if (cell.tagName === 'TD' && rs > 1 && r + rs >= rows.length) {
          cell.classList.add('zd-rowspan-ends-at-table-bottom');
        }
        for (let dr = 0; dr < rs; dr++) {
          for (let dc = 0; dc < cs; dc++) {
            (occupied[r + dr] = occupied[r + dr] || [])[col + dc] = true;
          }
        }
        col += cs;
      }
    }
  });
}

/**
 * Turn a "## FAQ" section (each item authored as `**Question?**` followed by its
 * answer in the same paragraph, optionally with extra answer paragraphs) into a
 * collapsible accordion.
 */
function buildFaqAccordions() {
  if (typeof document === 'undefined') return;
  const heads = document.querySelectorAll('.markdown h2');
  heads.forEach((h2) => {
    if (h2.getAttribute('data-zd-faq')) return;
    const label = h2.textContent.replace(/[^A-Za-z]/g, '').toUpperCase();
    if (label !== 'FAQ' && label !== 'FAQS') return;

    const els = [];
    let n = h2.nextElementSibling;
    while (n && n.tagName !== 'H2' && n.tagName !== 'H1') {
      els.push(n);
      n = n.nextElementSibling;
    }
    if (!els.length) return;

    // strip zero-width chars (heading anchor links add a trailing U+200B) before
    // testing/labelling questions.
    const clean = (s) => s.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '').trim();
    const isQuestion = (s) => /\?$/.test(clean(s));

    const items = [];
    let cur = null;
    els.forEach((el) => {
      // A new FAQ item starts at a paragraph whose leading <strong> is a QUESTION
      // (ends with "?"). Bold sub-labels inside an answer (e.g. "Design Rationale")
      // don't end with "?", so they stay part of the current answer.
      const startsStrong =
        el.tagName === 'P' &&
        el.firstChild &&
        el.firstChild.nodeType === 1 &&
        el.firstChild.tagName === 'STRONG' &&
        isQuestion(el.firstChild.textContent);
      if (el.tagName === 'H3' && isQuestion(el.textContent)) {
        cur = { q: clean(el.textContent), id: el.id, srcEl: el, answer: document.createElement('div') };
        items.push(cur);
      } else if (startsStrong) {
        const strong = el.firstChild;
        cur = { q: clean(strong.textContent), answer: document.createElement('div') };
        items.push(cur);
        // CLONE (never move) the part of the paragraph after the question
        const p = document.createElement('p');
        let nn = strong.nextSibling;
        while (nn) {
          if (!(nn.nodeName === 'BR' && !p.hasChildNodes())) p.appendChild(nn.cloneNode(true));
          nn = nn.nextSibling;
        }
        if (p.hasChildNodes() && p.textContent.trim()) cur.answer.appendChild(p);
      } else if (
        (el.tagName === 'UL' || el.tagName === 'OL') &&
        [...el.children].some((li) => {
          const st = li.querySelector && li.querySelector('strong, b');
          return st && isQuestion(st.textContent);
        })
      ) {
        // FAQ authored as a bullet list: each <li> is "**Question?** … answer …".
        [...el.children].forEach((li) => {
          if (li.tagName !== 'LI') return;
          const strong = li.querySelector('strong, b');
          if (strong && isQuestion(strong.textContent)) {
            cur = { q: clean(strong.textContent), answer: document.createElement('div') };
            items.push(cur);
            const liClone = li.cloneNode(true);
            // drop the question node (and its wrapping <p> when that <p> held only it)
            const qNode = liClone.querySelector('strong, b');
            if (qNode) {
              const wrapP = qNode.closest('p');
              if (wrapP && clean(wrapP.textContent) === clean(qNode.textContent)) wrapP.remove();
              else qNode.remove();
            }
            Array.from(liClone.childNodes).forEach((n) => cur.answer.appendChild(n));
          } else if (cur) {
            cur.answer.appendChild(li.cloneNode(true));
          }
        });
      } else if (cur) {
        cur.answer.appendChild(el.cloneNode(true)); // CLONE, don't move React nodes
      }
    });
    if (!items.length) return;

    const acc = document.createElement('div');
    acc.className = 'zd-faq';
    items.forEach((it) => {
      const item = document.createElement('div');
      item.className = 'zd-faq-item';
      // move the question heading's anchor id onto the accordion item so the right
      // TOC link scrolls here (the original heading is hidden), and remove it from
      // the hidden source to avoid a duplicate id.
      if (it.id) {
        item.id = it.id;
        if (it.srcEl) it.srcEl.removeAttribute('id');
      }
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'zd-faq-q';
      btn.setAttribute('aria-expanded', 'false');
      const chev = document.createElement('span');
      chev.className = 'zd-faq-chevron';
      chev.setAttribute('aria-hidden', 'true');
      const qt = document.createElement('span');
      qt.className = 'zd-faq-qtext';
      qt.textContent = it.q;
      btn.appendChild(chev);
      btn.appendChild(qt);
      const a = document.createElement('div');
      a.className = 'zd-faq-a';
      const inner = document.createElement('div');
      inner.className = 'zd-faq-a-inner';
      inner.appendChild(it.answer);
      a.appendChild(inner);
      btn.addEventListener('click', () => {
        const open = item.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(open));
      });
      item.appendChild(btn);
      item.appendChild(a);
      acc.appendChild(item);
    });

    h2.insertAdjacentElement('afterend', acc);
    // hide the original source elements (still owned by React — never remove/move
    // them, or React's removeChild on relocated nodes crashes the page). Hide via a
    // data attribute, NOT a class: React owns className on components like CodeBlock
    // and would overwrite our class on re-render, re-showing the source.
    els.forEach((el) => el.setAttribute('data-zd-faq-src', '1'));
    h2.setAttribute('data-zd-faq', '1');
  });
}

/**
 * Re-hide the FAQ source content. React can REPLACE a node (e.g. a CodeBlock) after
 * our initial marking, dropping the data attribute and re-showing the source. So we
 * (cheaply, idempotently) re-mark every sibling that sits between an accordion and
 * the next h1/h2 — that whole range is the cloned-away source.
 */
function reHideFaqSources() {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.zd-faq').forEach((acc) => {
    let n = acc.nextElementSibling;
    while (n && n.tagName !== 'H1' && n.tagName !== 'H2') {
      if (!n.hasAttribute('data-zd-faq-src')) n.setAttribute('data-zd-faq-src', '1');
      n = n.nextElementSibling;
    }
  });
}

let faqObserver = null;
function watchFaqSources() {
  if (typeof window === 'undefined' || faqObserver) return;
  const root = document.querySelector('.markdown')?.parentElement || document.body;
  let scheduled = false;
  faqObserver = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      reHideFaqSources();
    });
  });
  faqObserver.observe(root, { childList: true, subtree: true });
}

/** When the URL hash points at a FAQ accordion item, open it and scroll to it. */
function openFaqFromHash() {
  if (typeof document === 'undefined' || !location.hash) return;
  let id;
  try {
    id = decodeURIComponent(location.hash.slice(1));
  } catch (e) {
    id = location.hash.slice(1);
  }
  const item = id && document.getElementById(id);
  if (!item || !item.classList || !item.classList.contains('zd-faq-item')) return;
  item.classList.add('open');
  const btn = item.querySelector('.zd-faq-q');
  if (btn) btn.setAttribute('aria-expanded', 'true');
  // let the open transition start, then bring the item fully into view
  setTimeout(() => item.scrollIntoView({ block: 'start', behavior: 'smooth' }), 30);
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function getLogicalColumnCount(table) {
  let cols = 0;
  Array.from(table.rows || []).forEach((row) => {
    const count = Array.from(row.cells || []).reduce((sum, cell) => sum + (cell.colSpan || 1), 0);
    cols = Math.max(cols, count);
  });
  return cols;
}

function isSimpleTable(table) {
  const rows = Array.from(table.rows || []);
  if (!rows.length) return false;
  // A table is "simple" (flat horizontal-rule style — no outer frame, no vertical
  // column dividers) UNLESS it uses merged cells. Only rowspan/colspan need the
  // framed grid to stay readable; everything else (long text, list cells, many
  // columns) now renders as a simple table per design.
  if (table.querySelector('td[rowspan], th[rowspan], td[colspan], th[colspan]')) return false;
  return true;
}

function tagTableComplexity() {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.markdown table').forEach((table) => {
    const simple = isSimpleTable(table);
    table.dataset.zdocTable = simple ? 'simple' : 'complex';
    const wrapper = table.closest('.zd-table-scroll');
    if (wrapper) wrapper.dataset.zdocTable = simple ? 'simple' : 'complex';
  });
}

function estimateReadableTableWidth(table) {
  const cols = getLogicalColumnCount(table);
  if (cols < 2) return 0;

  let hasReadablePressure = cols >= 4;
  let hasLongTwoColumnProse = false;
  const colWidths = Array.from({length: cols}, (_, index) => {
    if (index === 0) return cols <= 3 ? 170 : 190;
    if (cols === 2) return 280;
    if (cols === 3) return index === 1 ? 210 : 280;
    if (cols === 4) return 220;
    return 150;
  });
  Array.from(table.rows || []).forEach((row, rowIndex) => {
    let col = 0;
    Array.from(row.cells || []).forEach((cell) => {
      const span = cell.colSpan || 1;
      const text = (cell.textContent || '').replace(/\s+/g, ' ').trim();
      const words = text.split(/\s+/).filter(Boolean);
      const longestWord = words.reduce((max, word) => Math.max(max, word.length), 0);
      const isHeader = rowIndex === 0 || cell.tagName === 'TH';
      const hasCode = !!cell.querySelector('code');
      const hasList = !!cell.querySelector('li');
      if (cols === 2 && text.length >= 110) {
        hasLongTwoColumnProse = true;
      }
      if (
        hasCode ||
        hasList ||
        longestWord >= 16 ||
        (cols === 2 && text.length >= 110) ||
        (cols >= 3 && (text.length >= 72 || (isHeader && text.length >= 18)))
      ) {
        hasReadablePressure = true;
      }
      const base = col === 0 ? (cols <= 3 ? 170 : 190) : (cols === 2 ? 280 : cols === 3 ? 210 : 150);
      const contentBase = cols === 4 && col > 0 ? 220 : base;
      const contentCap = (() => {
        if (col === 0) return cols <= 3 ? 240 : 230;
        if (cols === 2) return hasCode || longestWord >= 24 ? 520 : 420;
        if (cols === 3) return hasCode || hasList || text.length >= 72 ? 420 : 320;
        if (cols === 4) return 340;
        return hasCode || hasList ? 300 : 220;
      })();
      const byText = isHeader
        ? clamp(text.length * 7.2 + 34, contentBase, Math.max(contentBase, Math.min(contentCap, 360)))
        : clamp(
            Math.max(
              (hasCode ? Math.min(text.length, 58) * 7.6 : longestWord * 7.2) + 42,
              hasList ? 300 : 0,
              cols >= 3 && text.length >= 72 ? 320 : 0
            ),
            contentBase,
            contentCap
          );
      const perCol = Math.ceil(byText / span);
      for (let i = 0; i < span && col + i < cols; i++) {
        colWidths[col + i] = Math.max(colWidths[col + i], perCol);
      }
      col += span;
    });
  });

  const totalWidth = colWidths.reduce((sum, width) => sum + width, 0);
  if (hasLongTwoColumnProse) return Math.max(totalWidth, 860);
  return hasReadablePressure ? totalWidth : 0;
}

function getRenderedCompressionWidth(table, readableWidth) {
  const cols = getLogicalColumnCount(table);
  if (cols < 2) return 0;

  let compressed = false;
  Array.from(table.rows || []).forEach((row) => {
    Array.from(row.cells || []).forEach((cell) => {
      const rect = cell.getBoundingClientRect();
      const text = (cell.textContent || '').replace(/\s+/g, ' ').trim();
      if (!text) return;
      const lineHeight = parseFloat(getComputedStyle(cell).lineHeight) || 21;
      const lines = Math.round(cell.scrollHeight / lineHeight);
      const hasCode = !!cell.querySelector('code');
      const hasList = !!cell.querySelector('li');
      const longestWord = text.split(/\s+/).reduce((max, word) => Math.max(max, word.length), 0);
      if (
        (cols === 2 && rect.width < 440 && lines >= 6) ||
        (cols >= 3 && rect.width < 150 && lines >= 3) ||
        (cols >= 3 && lines >= 5) ||
        (hasCode && rect.width < 220 && longestWord >= 14) ||
        (hasList && rect.width < 240 && lines >= 4)
      ) {
        compressed = true;
      }
    });
  });

  if (!compressed) return 0;
  return readableWidth || Math.ceil(table.parentElement?.clientWidth || 0) + (cols === 2 ? 120 : 180);
}

function syncTableScrollEdge(w) {
  const overflow = w.scrollWidth > w.clientWidth + 1;
  const atEnd = !overflow || w.scrollLeft + w.clientWidth >= w.scrollWidth - 1;
  w.classList.toggle('zd-table-scroll--overflow', overflow);
  w.classList.toggle('zd-table-scroll--at-end', atEnd);
}

/**
 * A table wider than its viewport scrolls horizontally — its right edge is a
 * "content continues" cut, not the table's end. Tag those wrappers so CSS can drop
 * the frame's right border + rounded corners there.
 *
 * Some comparison tables can technically fit by crushing columns until headers and
 * row labels wrap every word. Treat those as overflow too by assigning a computed
 * readable min-width before measuring.
 */
function markScrollableTables() {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.zd-table-scroll').forEach((w) => {
    const table = w.querySelector('table');
    const readableWidth = table ? estimateReadableTableWidth(table) : 0;
    const compressionWidth = table ? getRenderedCompressionWidth(table, readableWidth) : 0;
    const targetWidth = Math.max(readableWidth, compressionWidth);
    if (table && targetWidth > w.clientWidth + 1) {
      w.style.setProperty('--zd-table-readable-min', `${Math.ceil(targetWidth)}px`);
      w.classList.add('zd-table-scroll--readable');
    } else {
      w.style.removeProperty('--zd-table-readable-min');
      w.classList.remove('zd-table-scroll--readable');
    }
    syncTableScrollEdge(w);
    if (!w.__zdTableScrollEdgeListener) {
      w.__zdTableScrollEdgeListener = true;
      w.addEventListener('scroll', () => syncTableScrollEdge(w), { passive: true });
    }
  });
}

let scrollMarkScheduled = false;
if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', openFaqFromHash);
  window.addEventListener('resize', () => {
    if (scrollMarkScheduled) return;
    scrollMarkScheduled = true;
    requestAnimationFrame(() => {
      scrollMarkScheduled = false;
      markScrollableTables();
    });
  });
}

/**
 * Collapsible <details> banners (Docusaurus admonition-style) only toggle when the
 * click lands on the <summary> itself; the banner's own header padding (the strip
 * around the summary) doesn't. Forward those header-padding clicks to the summary so
 * clicking anywhere on the header ROW expands/collapses it — without changing any
 * styling.
 */
function enableFullRowDetails() {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.markdown details > summary').forEach((summary) => {
    const d = summary.parentElement;
    if (!d || d.__fullRow) return;
    d.__fullRow = true;
    d.addEventListener('click', (e) => {
      // Only clicks that land on the <details> box itself (its header padding), not
      // on the summary or the expanded body.
      if (e.target !== d) return;
      const sr = summary.getBoundingClientRect();
      // header band only — ignore the bottom padding of an expanded banner.
      if (e.clientY <= sr.bottom + 14) {
        e.preventDefault();
        summary.click();
      }
    });
  });
}

function enhance() {
  tagTableComplexity();
  tagTableRowHeaders();
  buildFaqAccordions();
  reHideFaqSources();
  watchFaqSources();
  openFaqFromHash();
  markScrollableTables();
  enableFullRowDetails();
  // React may replace a CodeBlock node shortly after mount (Prism highlighting),
  // dropping our hide attribute — re-apply a few times to be safe.
  [150, 500, 1200].forEach((d) => setTimeout(reHideFaqSources, d));
  // fonts/layout settle after mount — re-measure overflow so the right frame edge
  // is correct once column widths are final.
  [150, 500, 1200].forEach((d) => setTimeout(markScrollableTables, d));
}

export function onRouteDidUpdate() {
  // wait a tick for the new route's DOM to mount
  setTimeout(enhance, 0);
}

if (typeof window !== 'undefined') {
  if (document.readyState !== 'loading') {
    setTimeout(enhance, 0);
  } else {
    window.addEventListener('DOMContentLoaded', enhance);
  }
}

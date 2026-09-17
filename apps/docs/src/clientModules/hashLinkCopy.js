/**
 * Heading anchors copy their own link.
 *
 * Docusaurus renders an <a class="hash-link"> after every heading; custom.css
 * draws it as a chain-link icon. Clicking it used to only jump to the anchor,
 * which left people to copy the URL out of the address bar by hand. Now the
 * click still jumps AND writes the absolute link to the clipboard, and the
 * chain swaps to a check for a moment so the copy is acknowledged.
 *
 * Done as a delegated listener rather than in the Heading wrapper because the
 * anchor is rendered by @theme-init/Heading, below our wrapper — one capture
 * listener catches every heading on every route without re-wrapping the theme.
 */

const COPIED_CLASS = 'zd-hash-copied';
const RESET_MS = 1600;

// keyed by element so a rapid second click restarts that icon's own timer
const resetTimers = new WeakMap();

// The selection trick: needs the node in the document and visible to the
// selection API, hence the off-screen position rather than display:none.
function legacyCopy(text) {
  const scratch = document.createElement('textarea');
  scratch.value = text;
  scratch.setAttribute('readonly', '');
  scratch.style.position = 'fixed';
  scratch.style.top = '-1000px';
  scratch.style.opacity = '0';
  document.body.appendChild(scratch);
  scratch.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch (err) {
    ok = false;
  }
  document.body.removeChild(scratch);
  return ok;
}

function copyText(text) {
  // The async clipboard is missing on http:// previews and old Safari, and can
  // also be PRESENT but refuse (embedded webviews, a denied permission) — so the
  // legacy path is a fallback for a rejection too, not only for a missing API.
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).catch(() => {
      if (legacyCopy(text)) return;
      throw new Error('copy failed');
    });
  }
  return legacyCopy(text)
    ? Promise.resolve()
    : Promise.reject(new Error('copy failed'));
}

function flashCopied(link) {
  link.classList.add(COPIED_CLASS);
  const pending = resetTimers.get(link);
  if (pending) clearTimeout(pending);
  resetTimers.set(
    link,
    setTimeout(() => {
      link.classList.remove(COPIED_CLASS);
      resetTimers.delete(link);
    }, RESET_MS),
  );
}

function onDocumentClick(event) {
  // cmd/ctrl/shift/alt-click and middle click mean "open this elsewhere" —
  // leave those to the browser and don't touch the clipboard.
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }
  const target = event.target;
  if (!target || typeof target.closest !== 'function') return;
  const link = target.closest('a.hash-link');
  if (!link) return;

  // .href on an <a href="#id"> resolves to the full absolute URL, hash included.
  copyText(link.href).then(
    () => flashCopied(link),
    () => {
      /* clipboard denied — the anchor jump still happened, so stay silent */
    },
  );
}

if (typeof window !== 'undefined') {
  document.addEventListener('click', onDocumentClick, true);
}

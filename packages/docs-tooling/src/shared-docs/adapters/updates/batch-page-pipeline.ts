// A page can retain up to 128 MiB of wire data and already renders a bounded
// window of historical snapshots internally. Keep this outer limit fixed.
const windowSize = 2

interface BatchPageSteps<Page, Child> {
  signal?: AbortSignal
  preflight(window: readonly Page[]): Promise<void>
  launch(page: Page, signal: AbortSignal): Promise<Child>
  retain(page: Page, child: NoInfer<Child>): Promise<void>
}

async function launchAndRetain<Page, Child>(window: readonly Page[], steps: BatchPageSteps<Page, Child>, failure: AbortController) {
  const {signal} = failure
  // Promises carry no wire. On failure drop completed siblings immediately,
  // even if aborting the other process group takes time to settle.
  const children = new Map<number, Child>()
  const discard = () => children.clear()
  signal.addEventListener('abort', discard, {once: true})
  try {
    await Promise.all(window.map(async (page, index) => {
      try {
        signal.throwIfAborted()
        const child = await steps.launch(page, signal)
        if (!signal.aborted) children.set(index, child)
      } catch (cause) {
        failure.abort(cause)
      }
    }))
    // The guarded launcher settles its real process group before returning.
    // Wait for every export to release its transient allocation before any
    // CAS retention can compete for the same filesystem free-space floor.
    signal.throwIfAborted()
    for (const [index, page] of window.entries()) {
      const child = children.get(index)!
      children.delete(index)
      await steps.retain(page, child)
      signal.throwIfAborted()
    }
  } finally {
    signal.removeEventListener('abort', discard)
    discard()
  }
}

/** Only schedules work. The caller owns the capture, scoped tickets, aggregate
 * allocation check, measured-child authentication and ordered CAS retention. */
export async function runBatchPagePipeline<Page, Child>(pages: readonly Page[], steps: BatchPageSteps<Page, Child>): Promise<void> {
  const failure = new AbortController()
  const {signal} = failure
  const cancel = () => failure.abort(steps.signal?.reason)
  steps.signal?.throwIfAborted()
  steps.signal?.addEventListener('abort', cancel, {once: true})
  try {
    let singlePageUntil = 0
    for (let start = 0; start < pages.length;) {
      const width = start < singlePageUntil ? 1 : windowSize
      const window = pages.slice(start, start + width)
      try {
        await steps.preflight(window)
      } catch (cause) {
        signal.throwIfAborted()
        // No ticket has been issued. Retry only the two members of this
        // budget-limited pair, each with a new full single-page preflight.
        if (window.length === 2 && cause instanceof Error &&
            (cause.message === 'BATCH_TRANSIENT_LIMIT' || cause.message === 'BATCH_FREE_SPACE_FLOOR')) {
          singlePageUntil = start + window.length
          continue
        }
        throw cause
      }
      signal.throwIfAborted()
      await launchAndRetain(window, steps, failure)
      start += window.length
    }
  } finally {
    steps.signal?.removeEventListener('abort', cancel)
  }
}

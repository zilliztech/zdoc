import {describe, expect, it} from 'vitest'
import {runBatchPagePipeline} from '../../adapters/updates/batch-page-pipeline'

function gate() {
  let release!: () => void
  const waiting = new Promise<void>(resolve => {release = resolve})
  return {waiting, release}
}

describe('batch page launch and retention', () => {
  it('preflights whole windows, overlaps exactly two launches and retains in registry order', async () => {
    const first = gate(), second = gate(), third = gate()
    const events: string[] = []
    const children = [first, second, third]
    const started = gate(), secondFinished = gate()
    const result = runBatchPagePipeline([0, 1, 2], {
      async preflight(window) {events.push('preflight ' + window.join(','))},
      async launch(page) {
        events.push('launch ' + page)
        if (page === 1) started.release()
        await children[page].waiting
        if (page === 1) secondFinished.release()
        return page
      },
      async retain(page, child) {expect(child).toBe(page); events.push('retain ' + page)},
    })
    await started.waiting
    second.release()
    await secondFinished.waiting
    expect(events).toEqual(['preflight 0,1', 'launch 0', 'launch 1'])
    third.release()
    first.release()
    await result
    expect(events).toEqual(['preflight 0,1', 'launch 0', 'launch 1', 'retain 0', 'retain 1', 'preflight 2', 'launch 2', 'retain 2'])
  })

  it('keeps unrelated preflight errors terminal before issuing either launch', async () => {
    const launches: number[] = []
    const result = runBatchPagePipeline([0, 1, 2], {
      async preflight(window) {
        expect(window).toEqual([0, 1])
        throw Error('BATCH_EXPORT_INVALID')
      },
      async launch(page) {launches.push(page)},
      async retain() {throw Error('unexpected retention')},
    })
    await expect(result).rejects.toThrow('BATCH_EXPORT_INVALID')
    expect(launches).toEqual([])
  })

  it.each(['BATCH_TRANSIENT_LIMIT', 'BATCH_FREE_SPACE_FLOOR'])('checks each page separately after a joint %s and returns to pairs', async code => {
    const events: string[] = []
    await runBatchPagePipeline([0, 1, 2, 3], {
      async preflight(window) {
        events.push('budget ' + window.join(','))
        if (window.length === 2 && window[0] === 0) throw Error(code)
      },
      async launch(page) {events.push('launch ' + page); return {id: page}},
      async retain(page, child) {expect(child.id).toBe(page); events.push('retain ' + page)},
    })
    expect(events).toEqual(['budget 0,1', 'budget 0', 'launch 0', 'retain 0', 'budget 1', 'launch 1', 'retain 1',
      'budget 2,3', 'launch 2', 'launch 3', 'retain 2', 'retain 3'])
  })

  it('propagates the single-page rejection after the preceding page was retained exactly once', async () => {
    const budgeted: number[][] = [], retained: number[] = []
    const singlePageError = Error('BATCH_FREE_SPACE_FLOOR')
    const result = runBatchPagePipeline([0, 1, 2], {
      async preflight(window) {
        budgeted.push([...window])
        if (window.length === 2) throw Error('BATCH_TRANSIENT_LIMIT')
        if (window[0] === 1) throw singlePageError
      },
      async launch(page) {return page},
      async retain(page) {retained.push(page)},
    })
    await expect(result).rejects.toBe(singlePageError)
    expect(budgeted).toEqual([[0, 1], [0], [1]])
    expect(retained).toEqual([0])
  })

  it.each(['launch', 'retain'] as const)('never retries once a ticket could have been issued, including %s budget errors', async phase => {
    const budgeted: number[][] = [], retained: number[] = []
    const error = Error('BATCH_TRANSIENT_LIMIT')
    const result = runBatchPagePipeline([0, 1, 2], {
      async preflight(window) {budgeted.push([...window])},
      async launch() {if (phase === 'launch') throw error},
      async retain(page) {retained.push(page); throw error},
    })
    await expect(result).rejects.toBe(error)
    expect(budgeted).toEqual([[0, 1]])
    expect(retained).toEqual(phase === 'launch' ? [] : [0])
  })

  it.each(['second launch', 'lifetime'] as const)('aborts the live sibling and awaits its settlement on %s failure', async failure => {
    const external = new AbortController(), started = gate(), aborted = gate(), settle = gate()
    const launched: number[] = [], retained: number[] = []
    const primary = Error('primary')
    let returned = false
    const result = runBatchPagePipeline([0, 1, 2], {
      signal: external.signal,
      async preflight() {},
      async launch(page, signal) {
        launched.push(page)
        if (page === 1) started.release()
        if (failure === 'second launch' && page === 1) throw primary
        await new Promise<void>(resolve => signal.addEventListener('abort', () => {
          aborted.release()
          resolve()
        }, {once:true}))
        await settle.waiting
        throw Error('sibling settled')
      },
      async retain(page) {retained.push(page); throw primary},
    }).finally(() => {returned = true})
    await started.waiting
    if (failure === 'lifetime') external.abort(primary)
    await aborted.waiting
    expect(returned).toBe(false)
    settle.release()
    await expect(result).rejects.toBe(primary)
    expect(launched).toEqual([0, 1])
    expect(retained).toEqual([])
  })

  it('waits for both exports to settle before retaining even the first page and stops on retention failure', async () => {
    const firstFinished = gate(), finishSecond = gate()
    const launched: number[] = [], retained: number[] = []
    const result = runBatchPagePipeline([0, 1, 2], {
      async preflight() {},
      async launch(page) {
        launched.push(page)
        if (page === 0) firstFinished.release()
        if (page === 1) await finishSecond.waiting
      },
      async retain(page) {retained.push(page); throw Error('CAS write failed')},
    })
    await firstFinished.waiting
    expect(launched).toEqual([0, 1])
    expect(retained).toEqual([])
    finishSecond.release()
    await expect(result).rejects.toThrow('CAS write failed')
    expect(retained).toEqual([0])
    expect(launched).toEqual([0, 1])
  })

  it('does not issue a launch after the parent lifetime expires during preflight', async () => {
    const parent = new AbortController()
    let launches = 0
    const result = runBatchPagePipeline([0], {
      signal: parent.signal,
      async preflight() {parent.abort(Error('deadline'))},
      async launch() {launches++},
      async retain() {throw Error('unexpected retention')},
    })
    await expect(result).rejects.toThrow('deadline')
    expect(launches).toBe(0)
  })
})

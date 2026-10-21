import type { GitHost, PullRequest } from '../types'

export class FakeGitHost implements GitHost {
  private readonly prs = new Map<number, PullRequest>()
  async createPullRequest(input: Pick<PullRequest, 'title' | 'head' | 'base'>): Promise<PullRequest> {
    const pr = { ...input, number: this.prs.size + 1, labels: [], comments: [], checks: {} }
    this.prs.set(pr.number, structuredClone(pr))
    return structuredClone(pr)
  }
  async getPullRequest(number: number) { return structuredClone(this.prs.get(number)) }
  private require(number: number): PullRequest {
    const pr = this.prs.get(number)
    if (!pr) throw new Error(`Unknown fixture PR: ${number}`)
    return pr
  }
  async setLabels(number: number, labels: string[]) { this.require(number).labels = [...labels] }
  async addComment(number: number, body: string) { this.require(number).comments.push(body) }
  async setCheck(number: number, name: string, state: PullRequest['checks'][string]) {
    this.require(number).checks[name] = state
  }
}

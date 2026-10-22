import { isBranchName, isCommit, isRepositoryPath } from '../core/yaml'

export type ReaderFailure = 'MISSING_COMMIT' | 'MISSING_BRANCH' | 'MISSING_FILE' | 'INVALID_INPUT' | 'GIT_ERROR'
export class MilvusDocsReaderError extends Error {
  constructor(readonly code: ReaderFailure, message: string) {
    super(message)
    this.name = 'MilvusDocsReaderError'
  }
}
export function requireCommit(commit: string): void {
  if (!isCommit(commit)) throw new MilvusDocsReaderError('INVALID_INPUT', 'Expected a complete lowercase commit SHA')
}
export function requirePath(path: string): void {
  if (!isRepositoryPath(path)) throw new MilvusDocsReaderError('INVALID_INPUT', 'Expected a repository-relative file path without traversal')
}
export function requireBranch(branch: string): void {
  if (!isBranchName(branch)) throw new MilvusDocsReaderError('INVALID_INPUT', 'Expected a local Git branch name')
}

// @vitest-environment node
import { FakeGitHost } from '../fake/git-host'
import { gitHostContract } from './suites'

gitHostContract('fake GitHost', () => new FakeGitHost())

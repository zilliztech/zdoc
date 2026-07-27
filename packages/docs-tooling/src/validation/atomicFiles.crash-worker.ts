import {writeAtomicRepositoryFiles} from './atomicFiles.ts';

const [repositoryRoot, mode, crashPoint] = process.argv.slice(2);
if (!repositoryRoot || !mode || !crashPoint) throw new Error('repository root, mode, and crash point are required');

const paths = mode === 'link'
  ? ['tmp/link-report.md', 'tmp/link-report.json', 'tmp/report_1.md', 'tmp/report_1.json']
  : ['.build-card-state.json'];

writeAtomicRepositoryFiles(
  repositoryRoot,
  paths.map(path => ({path, contents: `crashed-new:${path}\n`})),
  'Crash-test output',
  {
    afterRename: event => {
      if (`rename:${event.kind}:${event.operationIndex}` === crashPoint) process.kill(process.pid, 'SIGKILL');
    },
    afterJournal: event => {
      if (`journal:${event.phase}:${event.operationIndex ?? 'none'}` === crashPoint) process.kill(process.pid, 'SIGKILL');
    },
  },
);

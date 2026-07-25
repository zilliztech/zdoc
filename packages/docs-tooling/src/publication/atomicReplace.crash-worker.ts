import {atomicReplace} from './atomicReplace.ts';

const [root, stagedDirectory, stagedFile, baselineCommit, crashAfterInput] = process.argv.slice(2);
const crashAfter = crashAfterInput === 'committed' ? null : Number(crashAfterInput);
let renameCount = 0;

await atomicReplace({
  publicationRoot: root,
  baselineCommit,
  replacements: [
    {source: stagedDirectory, target: 'content/manual'},
    {source: stagedFile, target: 'generated/sidebar.js'},
  ],
  testing: {
    afterRename: () => {
    renameCount += 1;
    if (crashAfter !== null && renameCount === crashAfter) process.kill(process.pid, 'SIGKILL');
    },
    afterJournal: event => {
      if (crashAfter === null && event.phase === 'committed') process.kill(process.pid, 'SIGKILL');
    },
  },
});

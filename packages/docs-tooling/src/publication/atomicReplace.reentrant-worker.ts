import {atomicReplace, ownedTreeCommit} from './atomicReplace.ts';

const [root, stagedDirectory, baselineCommit] = process.argv.slice(2);
const ownedPaths = ['content/manual'] as const;

await atomicReplace({
  publicationRoot: root,
  baselineCommit,
  replacements: [{source: stagedDirectory, target: ownedPaths[0]}],
  validatePublication: () => {
    ownedTreeCommit(root, ownedPaths);
  },
});

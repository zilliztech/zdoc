// CLI registration for the REST availability runner. Live targets only:
// point --base at a Milvus REST v2 endpoint (default http://127.0.0.1:19530,
// the port-forward used by the milvus-cell vCluster flow). The suite creates
// and drops its own fixtures; the target environment must be disposable.
"use strict";

const {runSuite} = require('./runner');
const {runDataPlaneSuite} = require('./suite');

const AVAILABILITY_COMMANDS = ['rest-availability'];

function registerAvailabilityCommand(command) {
  command
    .description('Run the data-plane REST v2 parameter availability suite against a live endpoint')
    .requiredOption('--base <url>', 'REST v2 base URL, e.g. http://127.0.0.1:19530')
    .requiredOption('--label <label>', 'Matrix label, e.g. milvus-3.0.5')
    .option('--out <dir>', 'Output directory for the availability matrix', 'tmp/rest-availability')
    .action(async (opts) => {
      const {runDataPlaneSuite: suite} = require('./suite');
      const r = await runSuite({suite, base: opts.base, label: opts.label, outDir: opts.out});
      const bad = (r.counts.FAIL || 0) + (r.counts['NO-EFFECT'] || 0);
      if (bad > 0) {
        console.error(`${bad} case(s) failed or had no effect; inspect ${r.file}`);
        process.exitCode = 1;
      }
    });
}

module.exports = {registerAvailabilityCommand, AVAILABILITY_COMMANDS, runDataPlaneSuite};

if (require.main === module) {
  const {Command} = require('commander');
  const program = new Command();
  registerAvailabilityCommand(program.command('rest-availability'));
  program.parseAsync(process.argv).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

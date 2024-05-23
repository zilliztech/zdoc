const fs = require("fs");
const { exec } = require("child_process");
const {
	nginxConfigPath,
	validateChangedFiles,
	getNginxRedirects,
} = require("./common");

console.info(`***** Running check-404.js *****`);

fs.readFile(nginxConfigPath, "utf8", (err, fileContents) => {
	if (err) {
		console.error("Error reading nginx.conf:", err);
		return;
	}

	const redirects = getNginxRedirects(fileContents);

	const GIT_COMMAND_GET_LATEST_COMMIT_ID = "git rev-parse HEAD";
	exec(GIT_COMMAND_GET_LATEST_COMMIT_ID, (error, stdout, stderr) => {
		if (error) {
			console.error(`exec error: ${error}`);
			return;
		}
		if (stderr) {
			console.error(`stderr: ${stderr}`);
			return;
		}
		const commitId = stdout.trim();
		console.log(`commitId: ${commitId}`);

		const GIT_COMMAND_GET_CHANGED_FILES = `git diff-tree --diff-filter=D --diff-filter=R --no-commit-id --name-only -r ${commitId}`;
		exec(GIT_COMMAND_GET_CHANGED_FILES, (error, stdout, stderr) => {
			if (error) {
				console.error(`exec error: ${error}`);
				return;
			}
			if (stderr) {
				console.error(`stderr: ${stderr}`);
				return;
			}
			validateChangedFiles(stdout, redirects);
			console.info(`***** 🎉 check-404.js completed successfully *****\n`);
		});
	});
});

const fs = require("fs");
const { exec } = require("child_process");
const {
	nginxConfigPath,
	validateChangedFiles,
	getNginxRedirects,
} = require("./common");

console.info(`***** Running pre-check.js *****`);

fs.readFile(nginxConfigPath, "utf8", (err, fileContents) => {
	if (err) {
		console.error("Error reading nginx.conf:", err);
		return;
	}

	const redirects = getNginxRedirects(fileContents);

	const GIT_COMMAND_GET_CHANGED_FILES = `git diff --cached --name-only --diff-filter=DR`;
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
		console.info(`***** 🎉 pre-check.js completed successfully *****\n`);
	});
});

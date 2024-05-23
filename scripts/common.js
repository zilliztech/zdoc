const redirectRegex = /location\s+[=~]\s+(.+?)\s+{[^}]*return\s+301\s+(.+?);/gm;
const locationRegex = /location\s*(=|~)/;
const nginxConfigPath = "default.conf";

const getNginxRedirects = (fileContents) => {
	const redirects = [];
	let match;
	while ((match = redirectRegex.exec(fileContents)) !== null) {
		const from = match[1].trim();
		const to = match[2].trim();
		redirects.push({
			from: from,
			to: to,
			operator: locationRegex.exec(match[0])[1],
		});
	}
	const redirectsJson = JSON.stringify(redirects, null, 2);
	// console.log(redirectsJson);
	return redirects;
};

const validateChangedFiles = (filesString, redirects) => {
	const changedFiles = filesString
		.trim()
		.split("\n")
		.filter((item) => item.endsWith(".md") && !item.includes("README.md"))
		.map((item) => `/${item}`);
	console.log("\x1b[36m%s\x1b[0m", `changed markdown files: `, changedFiles);
	const unMatchedRedirects = [];
	changedFiles.forEach((changedFile) => {
		const matchedRedirect = redirects.some((redirect) => {
			if (redirect.operator === "=") {
				return changedFile === redirect.from;
			}
			return changedFile.match(redirect.from);
		});

		if (!matchedRedirect) {
			unMatchedRedirects.push(changedFile);
		}
	});
	console.log("\x1b[33m%s\x1b[0m", `unMatchedRedirects: `, unMatchedRedirects);
	if (unMatchedRedirects.length > 0) {
		throw new Error(
			`Some redirects are not matched with the changed files: ${unMatchedRedirects}`
		);
	}
};

module.exports = {
	redirectRegex,
	locationRegex,
	nginxConfigPath,
	getNginxRedirects,
	validateChangedFiles,
};

const redirectRegex = /location\s+[=~]\s+(.+?)\s+{[^}]*return\s+301\s+(.+?);/gm;
const locationRegex = /location\s*(=|~)/;
const nginxConfigPath = "default.conf";
const IGNORE_SLUG = "\\s*(.*)/gm;";

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
	return redirects;
};

const getAddedSlugs = (logString) => {
	const regex = /\+slug:\s*(.*)/gm;
	let match;
	let results = [];
	while ((match = regex.exec(logString)) !== null) {
		results.push(match[1]);
	}
	return results.filter((item) => item !== IGNORE_SLUG);
};

const getDeletedSlugs = (logString) => {
	const addedSlugs = getAddedSlugs(logString);
	const regex = /-slug:\s*(.*)/gm;
	let match;
	let results = [];
	while ((match = regex.exec(logString)) !== null) {
		results.push(match[1]);
	}
	return results.filter(
		(item) => item !== IGNORE_SLUG && !addedSlugs.includes(item)
	);
};

const validateChangedFiles = (changedSlugs, redirects) => {
	console.log("\x1b[36m%s\x1b[0m", `changed slugs: `, changedSlugs);
	const unMatchedRedirects = [];
	changedSlugs.forEach((slug) => {
		const matchedRedirect = redirects.some((redirect) => {
			if (redirect.operator === "=") {
				return slug === redirect.from;
			}
			return slug.match(redirect.from);
		});

		if (!matchedRedirect) {
			unMatchedRedirects.push(slug);
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
	getDeletedSlugs,
};

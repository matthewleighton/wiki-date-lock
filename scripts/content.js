const wikipediaRegex = /^https?:\/\/([a-z]+\.)?wikipedia\.org/i;
const fandomRegex = /^https?:\/\/([a-z]+\.)?fandom\.com/i;

function handleWikipedia() {
	var title = getPageTitle();

	console.log('title', title);

	// On some pages (like the main page), we don't want to redirect.
	if (isNonRedirectPage(title)) {
		return;
	}

	// If the user is already on an old revision, don't do anything.
	if (isAlreadyOldWiki()) {
		return handleLandOnOldWiki(title);
	}

	// Checking if the query param specifies that a redirect should be prevented.
	if (isRedirectPrevented()) {
		return;
	}
	
	
	const date = "2015-02-19T00:00:00Z"; // Format: YYYY-MM-DDTHH:MM:SSZ
	const apiUrl = "https://en.wikipedia.org/w/api.php";
	
	const queryUrl = `${apiUrl}?action=query&format=json&prop=revisions&titles=${title}&rvstart=${date}`

	console.log(queryUrl);

	fetch(queryUrl)
		.then((response) => response.json())
		.then((data) => {
			console.log(data);
			pages = data.query.pages;
			page_id = Object.keys(pages)[0];

			if (!('revisions' in pages[page_id])) {
				return handleNonExistentPage(title, date);
			}

			revision_id = pages[page_id].revisions[0].revid;

			redirectToRevision(title, revision_id);
		}).catch((error) => {
			console.log(error);
		});

}

// There are certain pages on which we don't want to redirect.
// For example, the main page, special pages, talk pages, etc.
function isNonRedirectPage(title) {
	if (title == 'Main_Page') {
		return true;
	}

	if (title.substring(0, 8) == 'Special:') {
		return true;
	}

	if (title.substring(0, 5) == 'Talk:') {
		return true;
	}

	if (title.substring(0, 5) == 'User:') {
		return true;
	}

	// This is triggered by the history or edit pages.
	if ('action' in getQueryParams()) {
		return true;
	}

	return false;
}

function getQueryParams() {
	const params = {};
	const queryString = window.location.search.substring(1);
	const queryArray = queryString.split("&");
	for (let i = 0; i < queryArray.length; i++) {
		const param = queryArray[i].split("=");
		params[param[0]] = param[1];
	}
	return params;
}

// Add a message explaining why the user was redirected.
function handleLandOnOldWiki(title) {
	var queryParams = getQueryParams();

	// If the user arrived here by some other means, don't do anything.
	if (!queryParams.wiki_date_lock_redirected) {
		return
	}

	// Wait for the page to load.
	window.addEventListener('load', (event) => {
		const divElement = document.getElementById('mw-content-subtitle');
		const newElement = document.createElement('p');
		
		var backUrl = `https://en.wikipedia.org/w/index.php?title=${title}&wiki_date_lock_prevent_redirect=true`;
		console.log('backUrl', backUrl);

		var message = `You were redirected here from the <a href="${backUrl}">latest version</a> of this page by the <i>Wiki Date Lock</i> extension.`;

		newElement.innerHTML = "<b style='color:red;'>" + message + "</b>";
	
		divElement.prepend(newElement);
	});

	
	
}

// Check if the user is already on an old revision
function isAlreadyOldWiki() {
	const oldWikiRegex = /oldid=\d+/;	
	return oldWikiRegex.test(window.location.href);
}

function handleNonExistentPage(title, date) {
	console.log("The page didn't exist on that date!");

	// Wait for the page to load.
	window.addEventListener('load', (event) => {
		const divElement = document.getElementById('bodyContent');
		const newElement = document.createElement('p');
		
		var message = '<b style="color:red;"><i>Wiki Date Lock:</i> The page did not exist on the specified date. Currently showing live page.</b>'

		newElement.innerHTML = message;
	
		divElement.prepend(newElement);
	});
}

function handleFandom() {
	alert("You're on Fandom!");
}

function getPageTitle() {
	query_title = getQueryParams().title;
	console.log('query_title', query_title);

	if (query_title) {
		return query_title;
	}

	var title = window.location.href.split("/").pop();
	title = title.split("#")[0]; // Remove anchor
	return title;
}

function redirectToRevision(title, revision_id) {
	const revisionUrl = `https://en.wikipedia.org/w/index.php?title=${title}&oldid=${revision_id}&wiki_date_lock_redirected=true`;
	window.location.href = revisionUrl;
}

// Return true if the query param specifies that a redirect should be prevented.
function isRedirectPrevented() {
	params = getQueryParams();
	return getQueryParams().wiki_date_lock_prevent_redirect;
}

function main() {
	if (wikipediaRegex.test(window.location.href)) {
		handleWikipedia();
	} else if (fandomRegex.test(window.location.href)) {
		handleFandom();
	}
}


main();


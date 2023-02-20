const wikipediaRegex = /^https?:\/\/([a-z]+\.)?wikipedia\.org/i;
const fandomRegex = /^https?:\/\/([a-z]+\.)?fandom\.com/i;

function handleWikipedia(selectedDate) {
	var title = getPageTitle();

	// On some pages (like the main page), we don't want to redirect.
	if (isNonRedirectPage(title)) {
		return;
	}

	// If the user is already on an old revision, don't do anything.
	if (isAlreadyOldWiki()) {
		return handleLandOnOldWiki(title, selectedDate);
	}

	// Checking if the query param specifies that a redirect should be prevented.
	if (isRedirectPrevented()) {
		return;
	}
	
	var formattedSelectedDate = formatSelectedDate(selectedDate);

	const apiUrl = "https://en.wikipedia.org/w/api.php";
	const queryUrl = `${apiUrl}?action=query&format=json&prop=revisions&titles=${title}&rvstart=${formattedSelectedDate}`

	fetch(queryUrl)
		.then((response) => response.json())
		.then((data) => {
			pages = data.query.pages;
			page_id = Object.keys(pages)[0];

			// If the page didn't exist on that date, we'll just show the live page.
			if (!('revisions' in pages[page_id])) {
				return handleNonExistentPage(title, selectedDate);
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

// Check if the user is already on an old revision.
function isAlreadyOldWiki() {
	const oldWikiRegex = /oldid=\d+/;	
	return oldWikiRegex.test(window.location.href);
}

// Get the query params from the URL.
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
function handleLandOnOldWiki(title, date) {
	var queryParams = getQueryParams();

	// If the user arrived here by some other means (i.e. navigated manually), don't do anything.
	if (!queryParams.wiki_date_lock_redirected) {
		return
	}

	// Wait for the page to load.
	window.addEventListener('load', (event) => {
		const divElement = document.getElementById('mw-content-subtitle');
	
		var backUrl = `https://en.wikipedia.org/w/index.php?title=${title}&wiki_date_lock_prevent_redirect=true`;
		var humanReadableDate = getHumanReadableDate(date);

		const newElement1 = document.createElement('p');
		var message1 = `This is the page as it existed on ${humanReadableDate}.`
		newElement1.innerHTML = "<b style='color:red;'>" + message1 + "</b>";

		const newElement2 = document.createElement('p');
		var message2 = `You were redirected here from the <a href="${backUrl}">latest version</a> of this page by the <i>Wiki Date Lock</i> extension.`;
		newElement2.innerHTML = "<b style='color:red;'>" + message2 + "</b>";

	
		divElement.prepend(newElement1);
		divElement.prepend(newElement2);
	});
}

function getHumanReadableDate(date) {
	var language = window.navigator.userLanguage || window.navigator.language;
	return new Date(date).toLocaleDateString(language, { weekday:"long", year:"numeric", month:"long", day:"numeric"})
}

function handleNonExistentPage(title, date) {
	console.log("The page didn't exist on that date!");

	// Wait for the page to load.
	window.addEventListener('load', (event) => {
		const divElement = document.getElementById('bodyContent');
		const newElement = document.createElement('p');
		
		var humanReadableDate = getHumanReadableDate(date);

		var message = `<b style="color:red;"><i>Wiki Date Lock:</i> The page did not exist on the specified date (${humanReadableDate}). Currently showing live page.</b>`

		newElement.innerHTML = message;
	
		divElement.prepend(newElement);
	});
}

function getPageTitle() {
	query_title = getQueryParams().title;

	// If the title is given in the query params, use that.
	if (query_title) {
		return query_title;
	}

	// Otherwise get the title from the URL.
	var title = window.location.href.split("/").pop();
	return title.split("#")[0]; // Remove anchor
}

// Format the date to be in the format that Wikipedia expects.
// YYYY-MM-DDTHH:MM:SSZ
function formatSelectedDate(selectedDate, website='wikipedia') {
	if (website == 'wikipedia') {
		return selectedDate + 'T00:00:00Z';
	}
	
	// Fandom uses a different format. (YYYYMMDDHHMMSS)
	return selectedDate.replaceAll('-', '') + '000000';
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

function handleFandom(selectedDate) {
	var title = getPageTitle();

	// If the user is already on an old revision, don't do anything.
	if (isAlreadyOldWiki()) {
		// alert('already on old page.')
		return handleLandOnOldWiki(title, selectedDate);
	} else {
		// alert('Not on old page');
	}

	// On some pages (like the main page), we don't want to redirect.
	if (isNonRedirectPage(title)) {
		return;
	}

	var formattedSelectedDate = formatSelectedDate(selectedDate, 'fandom');
	var queryUrl = document.location.href + '?offset=' + formattedSelectedDate + '&limit=1&action=history';

	console.log(queryUrl);

	fetch(queryUrl)
		.then(response => response.text())
		.then(html => {
			const parser = new DOMParser();
			const doc = parser.parseFromString(html, 'text/html');
			console.log(doc);
			// const element = doc.querySelector('.mw-tag-visualeditor');
			const parent = doc.querySelector('#pagehistory');
			const element = parent.querySelector('li');
			const revisionId = element.getAttribute('data-mw-revid');

			// alert('redirecting to revision ' + revisionId);
			window.location.href = document.location.href + '?oldid=' + revisionId;
		})
		.catch((error) => {
			console.log(error);
		});



}

function main() {
	chrome.storage.sync.get('selectedDate', (result) => {
		var selectedDate = result.selectedDate;

		// If the user hasn't selected a date, don't do anything.
		if (!selectedDate) {
			return
		}

		if (wikipediaRegex.test(window.location.href)) {
			handleWikipedia(selectedDate);
		} else if (fandomRegex.test(window.location.href)) {
			handleFandom(selectedDate);
		}
	});
	
	
}


main();


const wikipediaRegex = /^https?:\/\/([a-z]+\.)?wikipedia\.org/i;
const fandomRegex = /^https?:\/\/([a-z]+\.)?fandom\.com/i;

// Return true if the given URL is a wiki page.
function isWiki(url) {
	return wikipediaRegex.test(url) || fandomRegex.test(url);
}

// Given the URL for a wiki page, return the URL for the live version of that page.
function getLivePageUrl(currentUrl) {
  liveUrl = removeQueryParam(currentUrl, 'oldid');

  return liveUrl;
}

// Remove a particular query param from the URL.
function removeQueryParam(url, param) {
	var urlparts = url.split('?');   // split the URL into two parts: the base URL and the query string
	if (urlparts.length >= 2) {
		var prefix = encodeURIComponent(param) + '=';
		var pars = urlparts[1].split(/[&;]/g); // split the query string into an array of parameters
		// loop through the parameters to find the one to remove
		for (var i = pars.length; i-- > 0;) {
		if (pars[i].lastIndexOf(prefix, 0) !== -1) {  // if the parameter name starts with the prefix we're looking for
			pars.splice(i, 1);   // remove the parameter from the array
		}
		}
		// reconstruct the URL with the updated query string
		url = urlparts[0] + (pars.length > 0 ? '?' + pars.join('&') : '');
		return url;
	} else {
		return url;
	}
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
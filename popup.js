let popupDateField = document.getElementById('my-date-field');
let popupEnableCheckbox = document.getElementById('enable-checkbox');

// Get the value of the date field from storage.
chrome.storage.sync.get('selectedDate', (result) => {
	popupDateField.value = result.selectedDate;
});

chrome.storage.sync.get('lockEnabled', (result) => {
	console.log(result.lockEnabled);
	popupEnableCheckbox.checked = result.lockEnabled;
});

// Add a listener to the date field to get its value when it changes
popupDateField.addEventListener('change', () => {
	let selectedDate = popupDateField.value;
	chrome.storage.sync.set({ 'selectedDate': selectedDate });
});



// Add a listener to the checkbox to get its value when it changes
popupEnableCheckbox.addEventListener('change', () => {
	chrome.storage.sync.set({ 'lockEnabled': popupEnableCheckbox.checked });
	reloadCurrentTab(popupEnableCheckbox.checked);
});

function reloadCurrentTab(lockEnabled=false) {

	// Get the current tab and reload it.
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		currentUrl = tabs[0].url;

		// If the current tab is not a wiki page, don't do anything.
		if (!isWiki(currentUrl)) {
			return;
		}

		if (!lockEnabled) {
			targetUrl = getLivePageUrl(currentUrl);
			targetUrl = removeQueryParam(targetUrl, 'wiki_date_lock_redirected');
		} else {
			targetUrl = currentUrl;
		}

		chrome.tabs.update(tabs[0].id, { url: targetUrl });
	});
}
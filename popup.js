let popupDateField = document.getElementById('my-date-field');

// Get the value of the date field from storage.
chrome.storage.sync.get('selectedDate', (result) => {
	popupDateField.value = result.selectedDate;
});

// Add a listener to the date field to get its value when it changes
popupDateField.addEventListener('change', () => {
	let selectedDate = popupDateField.value;
	// Do something with the selected date, like save it to storage or send it to a server

	chrome.storage.sync.set({ 'selectedDate': selectedDate });
});
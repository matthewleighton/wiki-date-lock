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
	// let lockEnabled = document.querySelector('#enable-checkbox:checked').value;

	var isChecked = popupEnableCheckbox.checked;
	console.log(isChecked);
	chrome.storage.sync.set({ 'lockEnabled': isChecked });
});
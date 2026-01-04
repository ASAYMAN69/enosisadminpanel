// Settings functions
function loadSettings() {
    document.getElementById('company-name').value = settings.companyName;
    document.getElementById('contact-email').value = settings.contactEmail;
    document.getElementById('phone-number').value = settings.phoneNumber;
    document.getElementById('company-address').value = settings.address;
}

function saveSettings() {
    settings.companyName = document.getElementById('company-name').value;
    settings.contactEmail = document.getElementById('contact-email').value;
    settings.phoneNumber = document.getElementById('phone-number').value;
    settings.address = document.getElementById('company-address').value;
    
    alert('Settings saved successfully!');
    showPage('dashboard');
}
// Data management
function exportData() {
    const data = {
        projects: projects,
        settings: settings
    };
    const dataStr = JSON.stringify(data, null, 2);
    alert('Data exported successfully! (In a real app, this would download a file)');
    console.log('Exported ', dataStr);
}

function importData() {
    alert('Import functionality would be implemented here in a real app.');
}

function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
        projects = [];
        updateDashboard();
    }
}
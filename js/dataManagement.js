// Data management
function exportData() {
    const data = {
        projects: projects,

    };
    const dataStr = JSON.stringify(data, null, 2);
    alert('Data exported successfully! (In a real app, this would download a file)');
    console.log('Exported ', dataStr);
}

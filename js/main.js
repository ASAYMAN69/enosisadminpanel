// Initialize on load
document.addEventListener('DOMContentLoaded', async () => { // Changed to async
    await fetchProjects(); // Wait for projects to be fetched

    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('status-filter');

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }

    // Initial display of projects after fetching
    applyFilters();
});

// Close modals when clicking outside
document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.id);
        }
    });
});
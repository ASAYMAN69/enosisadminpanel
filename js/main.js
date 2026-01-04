// Initialize on load
document.addEventListener('DOMContentLoaded', initDashboard);

// Close modals when clicking outside
document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.id);
        }
    });
});
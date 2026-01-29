// Property functions
function showPropertyForm(status = null) {
    if (status) {
        document.getElementById('property-status').value = status;
    }
    document.getElementById('property-id').value = '';
    document.getElementById('property-db-id').value = '';
    document.getElementById('property-form').reset();
    if (status) {
        document.getElementById('property-status').value = status;
    }
    document.getElementById('property-submit-btn').innerHTML = '<i class="fas fa-save"></i> Add Project';
    document.getElementById('property-modal-title').textContent = 'Add New Project';
    showModal('property-modal');
}

async function saveProperty(event) {
    event.preventDefault();
    const dbId = document.getElementById('property-db-id').value;

    const property = {
        name: document.getElementById('property-name').value,
        location: document.getElementById('property-location').value,
        status: document.getElementById('property-status').value,
        description: document.getElementById('property-description').value,
        createdAt: new Date().toISOString()
    };

    let photosToSend = [];
    const currentPreviewItems = document.querySelectorAll('.image-preview-item');
    currentPreviewItems.forEach(item => {
        const src = item.dataset.imageSrc;
        if (src) {
            photosToSend.push(src);
        }
    });

    if (dbId) {
        // Update existing property via API
        const patchPayload = {
            id: parseInt(dbId), 
            projectName: property.name,
            location: property.location,
            description: property.description,
            status: property.status,
            photo: photosToSend 
        };

        try {
            const response = await fetch("https://enosis.cortex-ai.dev/webhook/enosis-patch-projects", {
                method: 'POST', // As specified by user's curl
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(patchPayload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API error: ${response.status} - ${errorData.message || response.statusText}`);
            }

            const apiResponse = await response.json();
            console.log('Project updated successfully via API:', apiResponse);
            alert('Project updated successfully!');

            fetchProjects();
            closeModal('property-modal');

        } catch (error) {
            console.error("Error updating project:", error);
            alert("Failed to update project: " + error.message);
        }
    } else {
        // Add new property via API
        const newId = Date.now(); // Generate a unique timestamp ID (integer for int8)

        const newProjectPayload = {
            id: newId, 
            projectName: property.name,
            location: property.location,
            description: property.description,
            status: property.status,
            photo: photosToSend // Now collected from previews
        };

        try {
            const response = await fetch("https://enosis.cortex-ai.dev/webhook/enosis-post-projects", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newProjectPayload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API error: ${response.status} - ${errorData.message || response.statusText}`);
            }

            const apiResponse = await response.json();
            console.log('Project added successfully via API:', apiResponse);
            alert('Project added successfully!');

            fetchProjects();
            closeModal('property-modal');

        } catch (error) {
            console.error("Error adding project:", error);
            alert("Failed to add project: " + error.message);
        }
    }
}

async function deleteProperty(id) {
    if (!id) {
        alert("Error: Project ID is missing for deletion.");
        console.error("Attempted to delete project with empty ID.");
        return;
    }

    if (confirm('Are you sure you want to delete this project?')) {
        try {
            const deleteApiUrl = `https://enosis.cortex-ai.dev/webhook/enosis-delete-projects?id=${encodeURIComponent(id)}`;
            
            const response = await fetch(deleteApiUrl, {
                method: 'GET' // As requested, a GET request
            });

            if (!response.ok) {
                const errorText = await response.text(); // Get raw text for generic errors
                throw new Error(`API error: ${response.status} - ${errorText || response.statusText}`);
            }

            // Assuming the API returns a success message or confirmation
            // const apiResponse = await response.json(); // Uncomment if API returns JSON on success
            console.log(`Project with ID ${id} deleted successfully.`);
            alert('Project deleted successfully!');

            // Re-fetch projects to update the dashboard with the changes from the API
            fetchProjects();
            updateDashboard();

        } catch (error) {
            console.error("Error deleting project:", error);
            alert("Failed to delete project: " + error.message);
        }
    }
}

function editProperty(id) {
    const property = projects.find(p => p.id === id);
    if (property) {
        document.getElementById('property-db-id').value = property.id; // Store the database ID
        document.getElementById('property-name').value = property.name;
        document.getElementById('property-location').value = property.location;
        document.getElementById('property-status').value = property.status;
        document.getElementById('property-description').value = property.description;
        document.getElementById('property-submit-btn').innerHTML = '<i class="fas fa-save"></i> Update Project';
        document.getElementById('property-modal-title').textContent = 'Edit Project';
        
        // Display existing photos in the preview area
        if (property.photo && property.photo.length > 0) {
            displayImagePreviews(property.photo, true); // Pass true to clear existing previews first
        } else {
            // Clear any existing previews if the project has no photos
            document.querySelector('.image-preview').innerHTML = '';
        }

        showModal('property-modal');
    }
}
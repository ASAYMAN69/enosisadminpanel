// Initialize the dashboard
function initDashboard() {
    // Set current date
    const now = new Date();
    currentdateEl.textContent = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Load settings
    loadSettings();

    // Fetch projects from API
    fetchProjects();
}

// Helper function to hide loading states and show content
function hideLoadingStates() {
    document.querySelectorAll('.loading-container').forEach(container => {
        container.style.display = 'none';
    });
    document.querySelectorAll('.recent-items, .properties-grid').forEach(el => {
        el.classList.remove('hidden');
    });
}

// Navigation
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    
    // Show selected page
    document.getElementById(pageId + '-page').classList.remove('hidden');
    
    // Update active navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`[onclick="showPage('${pageId}')"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Update dashboard if needed
    if (pageId === 'dashboard') {
        updateDashboard();
    }
    
    // If showing properties page and projects haven't been loaded yet, show loading
    if (pageId === 'properties' && projects.length === 0) {
        document.getElementById('properties-list-container').style.display = 'flex';
        document.getElementById('properties-list').classList.add('hidden');
        // Re-fetch projects if they haven't been loaded
        fetchProjects();
    }
}

// Modal functions
function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    // Reset forms
    if (modalId === 'property-modal') {
        document.getElementById('property-form').reset();
        document.querySelector('.image-preview').innerHTML = '';
        document.getElementById('property-id').value = '';
        document.getElementById('property-db-id').value = '';
        document.getElementById('property-submit-btn').innerHTML = '<i class="fas fa-save"></i> Add Project';
        document.getElementById('property-modal-title').textContent = 'Add New Project';
    }
}

// Function to render image previews with delete icons
// This will be called by editProperty and previewPropertyImage
function displayImagePreviews(imageSources, clearExisting = true) {
    const previewContainer = document.querySelector('.image-preview');
    if (clearExisting) {
        previewContainer.innerHTML = ''; // Clear all existing previews
    }

    imageSources.forEach(src => {
        if (!src) return; // Skip empty sources

        const previewWrapper = document.createElement('div');
        previewWrapper.className = 'image-preview-item';
        // Use a unique identifier for each image (e.g., hash of src or simply the src for now)
        previewWrapper.dataset.imageSrc = src; 

        const img = document.createElement('img');
        img.src = src;
        img.style.maxWidth = '100px';
        img.style.maxHeight = '100px';
        img.style.margin = '5px';
        img.style.border = '1px solid #ddd';
        img.style.borderRadius = '4px';

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-image-button';
        deleteButton.innerHTML = '&times;'; // Cross icon
        deleteButton.onclick = (event) => removeImagePreview(event, previewWrapper);

        previewWrapper.appendChild(img);
        previewWrapper.appendChild(deleteButton);
        previewContainer.appendChild(previewWrapper);
    });
}

// Image preview
async function previewPropertyImage(event) {
    const files = Array.from(event.target.files);
    
    if (files.length > 0) {
        try {
            // Convert new files to Base64
            const base64Images = await Promise.all(files.map(file => fileToBase64(file)));
            // Display new previews, without clearing existing ones
            displayImagePreviews(base64Images, false); 
        } catch (error) {
            console.error("Error converting file to base64 for preview:", error);
            alert("Failed to create image preview.");
        }
    }
}

// Update dashboard
function updateDashboard() {
    // Update stats
    totalProjectsEl.textContent = projects.length;

    // Categorize projects by status - USE EXACT STRING MATCHING
    const ongoingProjects = projects.filter(p => p.status === 'Ongoing');
    const upcomingProjects = projects.filter(p => p.status === 'Upcoming');
    const finishedProjects = projects.filter(p => p.status === 'Finished');

    console.log('Projects categorized:', { 
        ongoing: ongoingProjects.length, 
        upcoming: upcomingProjects.length, 
        finished: finishedProjects.length 
    });

    // Update ongoing projects
    const ongoingProjectsEl = document.getElementById('ongoing-projects');
    if (ongoingProjects.length === 0) {
        ongoingProjectsEl.innerHTML = `
            <div class="recent-item">
                <div class="recent-icon">
                    <i class="fas fa-construction"></i>
                </div>
                <div class="recent-info">
                    <h4>No ongoing projects yet</h4>
                    <p>Add your first ongoing project</p>
                </div>
            </div>
        `;
    } else {
        ongoingProjectsEl.innerHTML = '';
        const recentProjects = ongoingProjects.slice(-3).reverse();
        recentProjects.forEach(project => {
            const projectEl = document.createElement('div');
            projectEl.className = 'recent-item';
            projectEl.innerHTML = `
                <div class="recent-icon">
                    <i class="fas fa-construction"></i>
                </div>
                <div class="recent-info">
                    <h4>${project.name}</h4>
                    <p>${project.location}</p>
                </div>
            `;
            projectEl.onclick = () => editProperty(project.id);
            ongoingProjectsEl.appendChild(projectEl);
        });
    }

    // Update upcoming projects
    const upcomingProjectsEl = document.getElementById('upcoming-projects');
    if (upcomingProjects.length === 0) {
        upcomingProjectsEl.innerHTML = `
            <div class="recent-item">
                <div class="recent-icon">
                    <i class="fas fa-calendar-plus"></i>
                </div>
                <div class="recent-info">
                    <h4>No upcoming projects yet</h4>
                    <p>Add your first upcoming project</p>
                </div>
            </div>
        `;
    } else {
        upcomingProjectsEl.innerHTML = '';
        const recentProjects = upcomingProjects.slice(-3).reverse();
        recentProjects.forEach(project => {
            const projectEl = document.createElement('div');
            projectEl.className = 'recent-item';
            projectEl.innerHTML = `
                <div class="recent-icon">
                    <i class="fas fa-calendar-plus"></i>
                </div>
                <div class="recent-info">
                    <h4>${project.name}</h4>
                    <p>${project.location}</p>
                </div>
            `;
            projectEl.onclick = () => editProperty(project.id);
            upcomingProjectsEl.appendChild(projectEl);
        });
    }

    // Update finished projects
    const finishedProjectsEl = document.getElementById('finished-projects');
    if (finishedProjects.length === 0) {
        finishedProjectsEl.innerHTML = `
            <div class="recent-item">
                <div class="recent-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="recent-info">
                    <h4>No finished projects yet</h4>
                    <p>Add your first finished project</p>
                </div>
            </div>
        `;
    } else {
        finishedProjectsEl.innerHTML = '';
        const recentProjects = finishedProjects.slice(-3).reverse();
        recentProjects.forEach(project => {
            const projectEl = document.createElement('div');
            projectEl.className = 'recent-item';
            projectEl.innerHTML = `
                <div class="recent-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="recent-info">
                    <h4>${project.name}</h4>
                    <p>${project.location}</p>
                </div>
            `;
            projectEl.onclick = () => editProperty(project.id);
            finishedProjectsEl.appendChild(projectEl);
        });
    }

    // Update properties list
    const propertiesListEl = document.getElementById('properties-list');
    const noPropertiesEl = document.getElementById('no-properties');
    if (projects.length === 0) {
        propertiesListEl.innerHTML = '';
        noPropertiesEl.classList.remove('hidden');
    } else {
        noPropertiesEl.classList.add('hidden');
        propertiesListEl.innerHTML = '';
        projects.forEach(project => {
            const statusClass = project.status === 'Ongoing' ? 'status-ongoing' : 
                                project.status === 'Upcoming' ? 'status-upcoming' : 'status-finished';
            
            // Use the photo from API or fallback to icon - with proper error handling
            let imageSrcForCard = 'https://placehold.co/300x180/10b981/white?text=' + encodeURIComponent(project.name.charAt(0) || 'P');

            if (project.photo && project.photo.length > 0) {
                const firstPhoto = project.photo[0];
                if (firstPhoto.startsWith('data:image')) {
                    // It's a Base64 string
                    imageSrcForCard = firstPhoto;
                } else if (firstPhoto.startsWith('http')) {
                    // It's a URL
                    imageSrcForCard = firstPhoto;
                }
            }
            
            const propCard = document.createElement('div');
            propCard.className = 'property-card';
            propCard.innerHTML = `
                <div class="property-image">
                    <img src="${imageSrcForCard}" alt="${project.name}" 
                         data-project-id="${project.id}" 
                         data-current-image-index="0"
                         onerror="this.parentElement.innerHTML=\"<div style=\"width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:white;font-size:48px;background:linear-gradient(135deg, #10b981 0%, #059669 100%);\"><i class=\"fas fa-building\"></i></div>\">
                    
                    ${project.photo && project.photo.filter(Boolean).length > 1 ? `
                    <button class="nav-button prev-button" onclick="navigateProjectImage(event, '${project.id}', -1)">&lt;</button>
                    <button class="nav-button next-button" onclick="navigateProjectImage(event, '${project.id}', 1)">&gt;</button>
                    ` : ''}

                    <span class="property-status ${statusClass}">${project.status}</span>
                </div>
                <div class="property-content">
                    <h3 class="property-title">${project.name}</h3>
                    <div class="property-location">
                        <i class="fas fa-map-marker-alt"></i> ${project.location}
                    </div>
                    <div class="property-details">
                        <span>${project.status}</span>
                        <span><i class="fas fa-info-circle"></i> Project</span>
                    </div>
                    <div class="property-actions">
                        <button class="btn btn-secondary btn-sm" onclick="editProperty('${project.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteProperty('${project.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
            propertiesListEl.appendChild(propCard);
        });
    }
}

// Function to render image previews with delete icons
// This will be called by editProperty and previewPropertyImage
function displayImagePreviews(imageSources, clearExisting = true) {
    const previewContainer = document.querySelector('.image-preview');
    if (clearExisting) {
        previewContainer.innerHTML = ''; // Clear all existing previews
    }

    imageSources.forEach(src => {
        if (!src) return; // Skip empty sources

        const previewWrapper = document.createElement('div');
        previewWrapper.className = 'image-preview-item';
        // Use a unique identifier for each image (e.g., hash of src or simply the src for now)
        previewWrapper.dataset.imageSrc = src; 

        const img = document.createElement('img');
        img.src = src;
        img.style.maxWidth = '100px';
        img.style.maxHeight = '100px';
        img.style.margin = '5px';
        img.style.border = '1px solid #ddd';
        img.style.borderRadius = '4px';

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-image-button';
        deleteButton.innerHTML = '&times;'; // Cross icon
        deleteButton.onclick = (event) => removeImagePreview(event, previewWrapper);

        previewWrapper.appendChild(img);
        previewWrapper.appendChild(deleteButton);
        previewContainer.appendChild(previewWrapper);
    });
}

// Function to remove an image preview item
function removeImagePreview(event, previewWrapper) {
    event.stopPropagation(); // Stop event bubbling to parent elements
    previewWrapper.remove(); // Remove the entire preview item
}

function navigateProjectImage(event, projectId, direction) {
    event.stopPropagation(); // Prevent card click event from firing

    const project = projects.find(p => p.id === projectId);
    if (!project || !project.photo || project.photo.length < 2) {
        return; // No project, no photos, or only one photo
    }

    const imgElement = document.querySelector(`.property-card img[data-project-id='${projectId}']`);
    if (!imgElement) return;

    let currentIndex = parseInt(imgElement.getAttribute('data-current-image-index') || '0');
    let newIndex = currentIndex + direction;

    if (newIndex < 0) {
        newIndex = project.photo.length - 1; // Wrap around to the last image
    } else if (newIndex >= project.photo.length) {
        newIndex = 0; // Wrap around to the first image
    }

    imgElement.src = project.photo[newIndex];
    imgElement.setAttribute('data-current-image-index', newIndex);
}

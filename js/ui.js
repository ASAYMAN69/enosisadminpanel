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

// Image preview
function previewPropertyImage(event) {
    const previewContainer = document.querySelector('.image-preview');
    previewContainer.innerHTML = ''; // Clear existing previews

    const files = event.target.files;
    if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();

            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.maxWidth = '100px'; // Basic styling
                img.style.maxHeight = '100px';
                img.style.margin = '5px';
                img.style.border = '1px solid #ddd';
                img.style.borderRadius = '4px';
                previewContainer.appendChild(img);
            }
            reader.readAsDataURL(file);
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
                    <img src="${imageSrcForCard}" alt="${project.name}" onerror="this.parentElement.innerHTML=\`<div style=\"width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:white;font-size:48px;background:linear-gradient(135deg, #10b981 0%, #059669 100%);\"><i class=\"fas fa-building\"></i></div>\`">
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

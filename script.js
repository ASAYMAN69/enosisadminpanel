// Data storage (in-memory)
let projects = [];
let settings = {
    companyName: "GreenEstate Pro",
    contactEmail: "admin@greenestate.com",
    phoneNumber: "+1 (555) 123-4567",
    address: "123 Real Estate Ave, Suite 100, NY 10001"
};

// API Configuration - FIXED URL
const API_URL = "https://tahmidn8n.solven.app/webhook/574f9307-ff96-47a5-bbaf-bf28f7869625";
let currentAbortController = null;

// DOM Elements
const currentdateEl = document.getElementById('current-date');
const totalProjectsEl = document.getElementById('total-projects');

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

// Clean and validate URL helper function
function cleanImageUrl(url) {
    if (!url) return '';
    // Trim whitespace and remove any trailing spaces
    let cleanUrl = url.trim();
    // Remove any extra spaces within the URL
    cleanUrl = cleanUrl.replace(/\s+/g, ' ');
    // Remove trailing spaces after protocol
    cleanUrl = cleanUrl.replace(/https?:\/\s+/g, 'https://');
    return cleanUrl;
}

// Fetch projects from the webhook API with proper retry logic
async function fetchProjects(maxRetries = 5, retryDelay = 2000) {
    let retryCount = 0;
    
    // Cancel any ongoing request
    if (currentAbortController) {
        currentAbortController.abort();
    }
    
    const makeSingleRequest = async () => {
        currentAbortController = new AbortController();
        
        try {
            const response = await fetch(API_URL, {
                signal: currentAbortController.signal
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Fetch request was aborted');
                throw error;
            }
            throw error;
        }
    };
    
    while (retryCount <= maxRetries) {
        try {
            console.log(`Attempt ${retryCount + 1} to fetch projects...`);
            const data = await makeSingleRequest();
            
            // Check if we got valid data (non-empty array)
            if (Array.isArray(data) && data.length > 0) {
                console.log(`Successfully fetched ${data.length} projects`);
                // Map the API response to our internal project structure - PRESERVE DATABASE ID
                projects = data.map(project => {
                    // Handle photo array - take first photo if available, trim whitespace properly
                    let photoUrl = '';
                    if (project.photo && Array.isArray(project.photo) && project.photo.length > 0) {
                        // Clean the URL properly
                        photoUrl = cleanImageUrl(project.photo[0]);
                    }
                    
                    return {
                        id: project.id.toString(), // This is the database ID, preserved as string
                        name: project.projectName,
                        location: project.location,
                        status: project.type,
                        description: project.description,
                        photo: photoUrl,
                        createdAt: new Date().toISOString()
                    };
                });
                
                console.log('Mapped projects:', projects);
                
                // Update dashboard and show content
                updateDashboard();
                hideLoadingStates();
                return;
            } else {
                // Empty response - increment retry count and wait
                retryCount++;
                if (retryCount <= maxRetries) {
                    console.log(`Empty response received, waiting ${retryDelay}ms before retry ${retryCount}/${maxRetries}`);
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                }
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                // Request was aborted, exit the function
                console.log('Fetch aborted, exiting retry loop');
                return;
            }
            
            console.error(`Error on attempt ${retryCount + 1}:`, error);
            retryCount++;
            
            if (retryCount <= maxRetries) {
                console.log(`Waiting ${retryDelay}ms before retry ${retryCount}/${maxRetries}`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }
    }
    
    // If we reach here, all retries failed or max retries reached with empty data
    console.log('Max retries reached or all attempts failed, showing empty state');
    projects = [];
    updateDashboard();
    hideLoadingStates();
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
        document.getElementById('property-image-preview').style.display = 'none';
        document.getElementById('property-id').value = '';
        document.getElementById('property-db-id').value = '';
        document.getElementById('property-submit-btn').innerHTML = '<i class="fas fa-save"></i> Add Project';
        document.getElementById('property-modal-title').textContent = 'Add New Project';
    }
}

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

function saveProperty(event) {
    event.preventDefault();
    const dbId = document.getElementById('property-db-id').value;
    const property = {
        name: document.getElementById('property-name').value,
        location: document.getElementById('property-location').value,
        status: document.getElementById('property-status').value,
        description: document.getElementById('property-description').value,
        createdAt: new Date().toISOString()
    };

    if (dbId) {
        // Update existing property - preserve the database ID
        const index = projects.findIndex(p => p.id === dbId);
        if (index !== -1) {
            projects[index] = {
                ...projects[index],
                ...property
            };
        }
    } else {
        // Add new property - generate temporary ID (in real app, this would come from API)
        const newId = Date.now().toString();
        projects.push({
            id: newId,
            ...property,
            photo: ''
        });
    }

    updateDashboard();
    closeModal('property-modal');
}

function deleteProperty(id) {
    if (confirm('Are you sure you want to delete this project?')) {
        projects = projects.filter(p => p.id !== id);
        updateDashboard();
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
        showModal('property-modal');
    }
}

// Image preview
function previewPropertyImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('property-image-preview');
            preview.src = e.target.result;
            preview.style.display = 'block';
        }
        reader.readAsDataURL(file);
    }
}

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
            let imageUrl = 'https://placehold.co/300x180/10b981/white?text=' + encodeURIComponent(project.name.charAt(0) || 'P');
            if (project.photo) {
                imageUrl = project.photo;
            }
            
            const propCard = document.createElement('div');
            propCard.className = 'property-card';
            propCard.innerHTML = `
                <div class="property-image">
                    <img src="${imageUrl}" alt="${project.name}" onerror="this.parentElement.innerHTML='<div style=\"width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:white;font-size:48px;background:linear-gradient(135deg, #10b981 0%, #059669 100%);\"><i class=\"fas fa-building\"></i></div>'">
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
const BASE_URL = "https://tahmidn8n.solven.app";

// Function to upload an image and return the public URL
async function uploadImage(file) {
    const timestamp = Date.now().toString();
    const hash = await sha256(timestamp);
    const ext = file.name.split('.').pop();
    const fileName = `${hash}.${ext}`;

    const uploadUrl = `${BASE_URL}/webhook/postimage?name=${hash}&ext=${ext}`;

    const formData = new FormData();
    formData.append('data', file);

    const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
    });

    if (response.ok) {
        return `${BASE_URL}/webhook/getimage?name=${fileName}`;
    } else {
        throw new Error(`Image upload failed with status: ${response.status}`);
    }
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
                                        let photos = [];
                                        if (project.photo && Array.isArray(project.photo)) {
                                            photos = project.photo.map(url => cleanImageUrl(url));
                                        } else if (project.photo && typeof project.photo === 'string') {
                                            // If API mistakenly sends a single string, handle it
                                            photos = [cleanImageUrl(project.photo)];
                                        }
                                        
                                        return {
                                            id: project.id.toString(), // This is the database ID, preserved as string
                                            name: project.projectName,
                                            location: project.location,
                                            status: project.status, // Corrected from project.type
                                            description: project.description,
                                            photo: photos, // Ensure photo is always an array of URLs
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
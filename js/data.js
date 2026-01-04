// Data storage (in-memory)
let projects = [];
let settings = {
    companyName: "GreenEstate Pro",
    contactEmail: "admin@greenestate.com",
    phoneNumber: "+1 (555) 123-4567",
    address: "123 Real Estate Ave, Suite 100, NY 10001"
};

// API Configuration - FIXED URL
const API_URL = "https://getall.asayman669.workers.dev";
let currentAbortController = null;

// DOM Elements
const currentdateEl = document.getElementById('current-date');
const totalProjectsEl = document.getElementById('total-projects');
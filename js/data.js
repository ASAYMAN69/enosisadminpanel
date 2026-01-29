// Data storage (in-memory)
let projects = [];
let settings = {
    companyName: "enosis Admin Panel",
    contactEmail: "info@enosisltd.com",
    phoneNumber: "+880 222 223 305",
    address: "Novel House, Level 10, 137 Shantinagar, Dhaka 1217, Bangladesh"
};

// API Configuration - FIXED URL
const API_URL = "https://getall.asayman669.workers.dev";
let currentAbortController = null;

// DOM Elements
const currentdateEl = document.getElementById('current-date');
const totalProjectsEl = document.getElementById('total-projects');
// Constants
const HEARTBEAT_INTERVAL = 5 * 60 * 1000; // 5 minutes
const TAB_CHECK_INTERVAL = 1000; // 1 second

// Global variables
let heartbeatInterval;
let tabCheckInterval;

// Function to get account states from GitHub
async function getAccountStates() {
    try {
        const response = await fetch('https://api.github.com/repos/DenasWindsor/games-folder-main/contents/account-states.json');
        const data = await response.json();
        const content = JSON.parse(atob(data.content));
        return content.accounts;
    } catch (error) {
        console.error('Error fetching account states:', error);
        return null;
    }
}

// Function to update account states on GitHub
async function updateAccountStates(states) {
    try {
        // First get the current file to get its SHA
        const response = await fetch('https://api.github.com/repos/DenasWindsor/games-folder-main/contents/account-states.json');
        const data = await response.json();
        
        // Prepare the update
        const updateData = {
            message: 'Update account states',
            content: btoa(JSON.stringify({ accounts: states }, null, 4)),
            sha: data.sha
        };

        // Update the file
        const updateResponse = await fetch('https://api.github.com/repos/DenasWindsor/games-folder-main/contents/account-states.json', {
            method: 'PUT',
            headers: {
                'Authorization': `token ${process.env.SAVE_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        return updateResponse.ok;
    } catch (error) {
        console.error('Error updating account states:', error);
        return false;
    }
}

// Function to send heartbeat
async function sendHeartbeat() {
    const userData = JSON.parse(sessionStorage.getItem('userData'));
    if (!userData) return;

    // Get current account states
    const accountStates = await getAccountStates();
    if (!accountStates) return;

    // Update last activity time
    accountStates[userData.username].lastActivity = Date.now();
    await updateAccountStates(accountStates);
}

// Function to check for multiple tabs
function checkMultipleTabs() {
    const userData = JSON.parse(sessionStorage.getItem('userData'));
    if (!userData) return;

    const currentTabId = localStorage.getItem('currentTabId');
    const activeTabId = localStorage.getItem('activeTabId');

    // If this is the first tab
    if (!activeTabId) {
        localStorage.setItem('activeTabId', currentTabId);
        return;
    }

    // If this tab is not the active tab
    if (currentTabId !== activeTabId) {
        // Clear session and redirect
        sessionStorage.clear();
        window.location.href = 'index.html?message=Please close other tabs before logging in';
    }
}

// Function to initialize session management
function initializeSessionManager() {
    // Generate a unique ID for this tab
    const tabId = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('currentTabId', tabId);

    // Set up heartbeat
    heartbeatInterval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    // Set up tab checking
    tabCheckInterval = setInterval(checkMultipleTabs, TAB_CHECK_INTERVAL);

    // Check for multiple tabs immediately
    checkMultipleTabs();
}

// Function to cleanup session management
function cleanupSessionManager() {
    // Clear heartbeat interval
    clearInterval(heartbeatInterval);
    clearInterval(tabCheckInterval);

    // If this was the active tab, clear the active tab ID
    const currentTabId = localStorage.getItem('currentTabId');
    const activeTabId = localStorage.getItem('activeTabId');
    if (currentTabId === activeTabId) {
        localStorage.removeItem('activeTabId');
    }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', initializeSessionManager);

// Cleanup when the page unloads
window.addEventListener('beforeunload', cleanupSessionManager); 
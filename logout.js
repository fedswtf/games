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

// Handle logout
async function handleLogout() {
    try {
        // Get current user data
        const userData = JSON.parse(sessionStorage.getItem('userData'));
        if (!userData) return;

        // Get current account states
        const accountStates = await getAccountStates();
        if (!accountStates) return;

        // Reset inUse state for the current user (except for guest and md)
        if (userData.username !== 'guest' && userData.username !== 'md') {
            accountStates[userData.username].inUse = false;
            // Update states on GitHub
            await updateAccountStates(accountStates);
        }

        // Clear session storage
        sessionStorage.clear();

        // Redirect to login page
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error during logout:', error);
    }
} 
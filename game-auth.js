// Function to check if a game is accessible
async function checkGameAccess(gameName) {
    // Get the user data from sessionStorage
    const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
    console.log('Full user data:', userData);
    const isBetaTester = userData.isBetaTester || false;
    const allGames = userData.allGames || false;
    const gameAccess = userData.gameAccess || {};

    // If user has allGames flag, they have access to all non-beta games
    if (allGames) {
        try {
            const response = await fetch('/config.json');
            if (response.ok) {
                const config = await response.json();
                const gameConfig = config.games[gameName];
                if (gameConfig && gameConfig.beta === true) {
                    // If game is beta, only beta testers can access it
                    if (!isBetaTester) {
                        console.log(`User with allGames flag cannot access beta game ${gameName}`);
                        return false;
                    }
                }
                console.log(`User with allGames flag has access to ${gameName}`);
                return true;
            }
        } catch (error) {
            console.log(`Error checking config for ${gameName}:`, error);
        }
    }

    // If user is a beta tester, check game status in config
    if (isBetaTester) {
        try {
            const response = await fetch('/config.json');
            if (response.ok) {
                const config = await response.json();
                const gameConfig = config.games[gameName];
                if (gameConfig && gameConfig.beta === true) {
                    console.log(`Beta tester has access to ${gameName}`);
                    return true;
                }
            }
        } catch (error) {
            console.log(`Error checking config for ${gameName}:`, error);
        }
    }

    // Check if the game exists in gameAccess and is true
    if (gameAccess[gameName] === true) {
        console.log(`User has specific access to ${gameName}`);
        return true;
    }

    console.log(`User does not have access to ${gameName}`);
    return false;
}

// Run check when page loads
document.addEventListener('DOMContentLoaded', checkGameAccess); 
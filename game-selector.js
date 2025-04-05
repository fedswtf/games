// Cache for config data
let configCache = null;

// Function to check if a game has a beta.json file
async function hasBetaJson(gameKey) {
    try {
        // If we have cached config, use it
        if (configCache) {
            const gameConfig = configCache.games[gameKey];
            console.log(`[Beta Check] Using cached config for ${gameKey}:`, gameConfig);
            return gameConfig && gameConfig.beta === true;
        }

        // Fetch config with cache control headers
        const response = await fetch('/config.json', {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });

        if (!response.ok) {
            console.error(`[Beta Check] Failed to fetch config.json: ${response.status} ${response.statusText}`);
            return false;
        }

        const config = await response.json();
        configCache = config; // Cache the config

        const gameConfig = config.games[gameKey];
        console.log(`[Beta Check] Fetched config for ${gameKey}:`, gameConfig);
        
        if (!gameConfig) {
            console.warn(`[Beta Check] No config found for game: ${gameKey}`);
            return false;
        }

        const isBeta = gameConfig.beta === true;
        console.log(`[Beta Check] ${gameKey} beta status:`, isBeta);
        return isBeta;
    } catch (error) {
        console.error(`[Beta Check] Error checking beta status for ${gameKey}:`, error);
        return false;
    }
}

// Function to check if a game is accessible
async function isGameAccessible(gameId) {
    // Get the user data from sessionStorage
    const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
    console.log('Full user data:', userData);
    const gameAccess = userData.gameAccess || {};
    const isBetaTester = userData.isBetaTester || false;
    const allGames = userData.allGames || false;
    
    // Convert gameId to match the format in gameAccess
    // Remove 'button' suffix and get the game name
    let gameKey = gameId.replace('-button', '');
    
    // Convert to proper game name format
    switch(gameKey.toLowerCase()) {
        case 'sudoku':
            gameKey = 'Sudoku';
            break;
        case 'snake':
            gameKey = 'Snake';
            break;
        case 'whackamole':
            gameKey = 'WhackAMole';
            break;
        case 'tetris':
            gameKey = 'Tetris';
            break;
        case 'spaceshooter':
            gameKey = 'SpaceShooter';
            break;
        case 'paperplane':
            gameKey = 'PaperPlane';
            break;
        case 'memory':
            gameKey = 'Memory';
            break;
        case 'doodlejump':
            gameKey = 'DoodleJump';
            break;
        case 'brickbreaker':
            gameKey = 'BrickBreaker';
            break;
        case 'tictactoe':
        case 'tic-tac-toe':
            gameKey = 'TicTacToe';
            break;
        case 'test':
            gameKey = 'Test';
            break;
        case 'pong':
            gameKey = 'Pong';
            break;
        case 'date-time':
            gameKey = 'DateAndTime';
            break;
        case 'cookieclicker':
            gameKey = 'CookieClicker';
            break;
        default:
            gameKey = gameKey.charAt(0).toUpperCase() + gameKey.slice(1);
    }

    // Check if the game is in beta
    const hasBeta = await hasBetaJson(gameKey);
    console.log(`[Access Check] ${gameKey} beta status:`, hasBeta);

    // If user is a beta tester and game is in beta, grant access
    if (isBetaTester && hasBeta) {
        console.log(`[Access Check] Beta tester has access to beta game ${gameKey}`);
        return true;
    }

    // If user has allGames flag and game is not in beta, grant access
    if (allGames && !hasBeta) {
        console.log(`[Access Check] User with allGames flag has access to non-beta game ${gameKey}`);
        return true;
    }

    // Check if the game exists in gameAccess and is true
    if (gameAccess[gameKey] === true) {
        console.log(`[Access Check] User has specific access to ${gameKey}`);
        return true;
    }

    console.log(`[Access Check] User does not have access to ${gameKey}`);
    return false;
}


// Function to handle game button clicks
function handleGameClick(gameId) {
    return async function(e) {
        e.preventDefault();
        
        // Check guest access first
        const hasAccess = await checkGuestAccess(gameId);
        if (!hasAccess) {
            return;
        }
        
        // Check if the game is accessible
        const isAccessible = await isGameAccessible(gameId);
        if (!isAccessible) {
            alert('You do not have access to this game.');
            return;
        }

        // Get the game key and check if it's a beta game
        const gameKey = convertGameKey(gameId);
        const hasBeta = await hasBetaJson(gameKey);
        
        // Get the original href from the link
        const link = e.currentTarget;
        const gamePath = link.href;
        
        // If it's a beta game, redirect to beta warning page
        if (hasBeta) {
            window.location.href = `/beta-warning.html?game=${encodeURIComponent(gameKey)}&path=${encodeURIComponent(gamePath)}`;
        } else {
            window.location.href = gamePath;
        }
    };
}

// Function to convert game ID to folder path
function convertGamePath(gameId) {
    // Remove 'button' suffix and get the game name
    let gamePath = gameId.replace('-button', '');
    
    // Convert to proper folder name format based on actual folder names
    switch(gamePath.toLowerCase()) {
        case 'sudoku':
            return 'SudokuGame';
        case 'snake':
            return 'Snake';
        case 'whackamole':
            return 'WhackAMole';
        case 'tetris':
            return 'Tetris';
        case 'spaceshooter':
            return 'SpaceShooter';
        case 'paperplane':
            return 'PaperPlane';
        case 'memory':
            return 'Memory';
        case 'doodlejump':
            return 'DoodleJump';
        case 'brickbreaker':
            return 'BrickBreaker';
        case 'tictactoe':
        case 'tic-tac-toe':
            return 'TicTacToe';
        case 'test':
            return 'Test';
        case 'pong':
            return 'Pong';
        case 'date-time':
            return 'date-time';
        case 'cookieclicker':
            return 'CookieClicker';
        default:
            return gamePath.charAt(0).toUpperCase() + gamePath.slice(1);
    }
}

// Function to convert game ID to proper format for config.json
function convertGameKey(gameId) {
    // Remove 'button' suffix and get the game name
    let gameKey = gameId.replace('-button', '');
    
    // Convert to proper game name format for config.json
    switch(gameKey.toLowerCase()) {
        case 'sudoku':
            return 'Sudoku';
        case 'snake':
            return 'Snake';
        case 'whackamole':
            return 'WhackAMole';
        case 'tetris':
            return 'Tetris';
        case 'spaceshooter':
            return 'SpaceShooter';
        case 'paperplane':
            return 'PaperPlane';
        case 'memory':
            return 'Memory';
        case 'doodlejump':
            return 'DoodleJump';
        case 'brickbreaker':
            return 'BrickBreaker';
        case 'tictactoe':
        case 'tic-tac-toe':
            return 'TicTacToe';
        case 'test':
            return 'Test';
        case 'pong':
            return 'Pong';
        case 'date-time':
            return 'date-time';
        case 'cookie-clicker':
            return 'CookieClicker';
        default:
            return gameKey.charAt(0).toUpperCase() + gameKey.slice(1);
    }
}

// Function to sort games based on accessibility, beta status, and alphabetically
async function sortGames() {
    const gamesGrid = document.getElementById('gamesGrid');
    const gameContainers = Array.from(gamesGrid.children);
    
    // Get user data
    const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
    const isBetaTester = userData.isBetaTester || false;
    const hasAllGames = userData.allGames || false;
    const gameAccess = userData.gameAccess || {};

    console.log('[Sort Games] User data:', { isBetaTester, hasAllGames });

    // Create arrays for different categories
    const accessibleNonBeta = [];
    const accessibleBeta = [];
    const inaccessibleNonBeta = [];
    const inaccessibleBeta = [];

    // Categorize games
    for (const container of gameContainers) {
        const button = container.querySelector('button');
        if (!button) continue;

        const gameId = button.id;
        const gameKey = convertGameKey(gameId);
        const title = container.querySelector('h1').textContent;
        
        const isAccessible = await isGameAccessible(gameId);
        const hasBeta = await hasBetaJson(gameKey);
        
        console.log(`[Sort Games] Game: ${gameKey}, Accessible: ${isAccessible}, Beta: ${hasBeta}`);
        
        const gameInfo = {
            container,
            title,
            gameKey,
            gameId,
            button,
            hasBeta
        };

        if (isAccessible) {
            if (hasBeta) {
                accessibleBeta.push(gameInfo);
            } else {
                accessibleNonBeta.push(gameInfo);
            }
        } else {
            if (hasBeta) {
                inaccessibleBeta.push(gameInfo);
            } else {
                inaccessibleNonBeta.push(gameInfo);
            }
        }
    }

    // Sort each category alphabetically
    const sortByTitle = (a, b) => a.title.localeCompare(b.title);
    accessibleNonBeta.sort(sortByTitle);
    accessibleBeta.sort(sortByTitle);
    inaccessibleNonBeta.sort(sortByTitle);
    inaccessibleBeta.sort(sortByTitle);

    // Clear the grid
    gamesGrid.innerHTML = '';

    // Combine all categories in the desired order
    const sortedGames = [
        ...accessibleNonBeta,
        ...accessibleBeta,
        ...inaccessibleNonBeta,
        ...inaccessibleBeta
    ];

    // Add games to the grid with proper styling
    for (const game of sortedGames) {
        const { container, hasBeta, gameKey, gameId, button } = game;
        
        // Add beta styling if needed
        if (hasBeta) {
            container.classList.add('beta-game');
            const title = container.querySelector('h1');
            const betaSpan = document.createElement('span');
            betaSpan.className = 'beta-label';
            betaSpan.textContent = ' (beta)';
            title.appendChild(betaSpan);
        }

        // Update link to use click handler
        const link = container.querySelector('.game-link');
        if (link) {
            link.onclick = handleGameClick(gameId);
        }

        // Update button state
        if (button) {
            const isAccessible = await isGameAccessible(gameId);
            if (!isAccessible) {
                button.disabled = true;
                button.textContent = 'Access Denied';
            } else {
                button.disabled = false;
                button.textContent = `Play ${gameKey}`;
            }
        }

        gamesGrid.appendChild(container);
    }
}


// Function to filter games based on search
async function searchGames() {

    const searchTerm = document.getElementById('searchBar').value.toLowerCase();
    const menuContainers = document.getElementsByClassName('menuContainer');

    // Get user data for access checking
    const user = JSON.parse(userData);
    const isBetaTester = user.isBetaTester || false;
    const allGames = user.allGames || false;
    const gameAccess = user.gameAccess || {};

    for (const container of menuContainers) {
        const title = container.querySelector('h1').textContent.toLowerCase();
        const description = container.querySelector('p').textContent.toLowerCase();
        const button = container.querySelector('button');
        const gameId = button.id;
        const gameKey = gameId.replace('-button', '').replace(/-/g, '');
        
        // Convert gameKey to proper format for access checking
        let formattedGameKey = gameKey;
        switch(gameKey.toLowerCase()) {
            case 'sudoku':
                formattedGameKey = 'Sudoku';
                break;
            case 'snake':
                formattedGameKey = 'Snake';
                break;
            case 'whackamole':
                formattedGameKey = 'WhackAMole';
                break;
            case 'tetris':
                formattedGameKey = 'Tetris';
                break;
            case 'spaceshooter':
                formattedGameKey = 'SpaceShooter';
                break;
            case 'paperplane':
                formattedGameKey = 'PaperPlane';
                break;
            case 'memory':
                formattedGameKey = 'Memory';
                break;
            case 'doodlejump':
                formattedGameKey = 'DoodleJump';
                break;
            case 'brickbreaker':
                formattedGameKey = 'BrickBreaker';
                break;
            case 'tictactoe':
            case 'tic-tac-toe':
                formattedGameKey = 'TicTacToe';
                break;
            case 'test':
                formattedGameKey = 'Test';
                break;
        }

        // Check if game is in beta
        const isBeta = await hasBetaJson(formattedGameKey);
        
        // Check if user has access to the game
        let hasAccess = false;
        if (isBeta && isBetaTester) {
            hasAccess = true;
        } else if (allGames && !isBeta) {
            hasAccess = true;
        } else {
            hasAccess = gameAccess[formattedGameKey] === true;
        }

        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            container.classList.remove('hidden');
            
            // If user doesn't have access, redirect to game selector
            if (!hasAccess) {
                const link = container.querySelector('.game-link');
                if (link) {
                    link.style.pointerEvents = 'none';
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        window.location.href = '/game-selector.html';
                    });
                }
            }
        } else {
            container.classList.add('hidden');
        }
    }
} 

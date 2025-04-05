// Check if user is logged in
function checkLogin() {
    const userData = sessionStorage.getItem('userData');
    if (!userData) {
        window.location.href = 'index.html';
        return;
    }
    return JSON.parse(userData);
}

// Check game access
function checkGameAccess(gameName) {
    const userData = checkLogin();
    if (!userData) return false;
    
    // If user has allGames flag, they have access to all non-beta games
    if (userData.allGames) {
        return true;
    }
    
    return userData.gameAccess[gameName] || false;
}

// Sign out function
function signOut() {
    sessionStorage.removeItem('userData');
    window.location.href = 'index.html';
}

// Update game buttons based on access
function updateGameAccess() {
    const userData = checkLogin();
    if (!userData) return;

    // Display username in welcome message
    const gameSelectorTitle = document.getElementById('gameSelectorTitle');
    if (gameSelectorTitle) {
        gameSelectorTitle.textContent = `Welcome, ${userData.username}!`;
    }

    // List of all game buttons
    const gameButtons = {
        'Sudoku': 'sudokuButton',
        'Snake': 'snakeButton',
        'WhackAMole': 'whackamoleButton',
        'Tetris': 'tetrisButton',
        'SpaceShooter': 'spaceshooterButton',
        'PaperPlane': 'paperplaneButton',
        'Memory': 'memoryButton',
        'DoodleJump': 'doodlejumpButton',
        'BrickBreaker': 'brickBreakerButton',
        'Pong': 'pongButton',
        'TicTacToe': 'ticTacToeButton',
        'Test': 'testButton',
        'CookieClicker': 'cookie-clicker-button'
    };

    // Update each game button based on access
    Object.entries(gameButtons).forEach(([gameName, buttonId]) => {
        const button = document.getElementById(buttonId);
        if (button) {
            // If user has allGames flag, they have access to all non-beta games
            if (userData.allGames) {
                button.disabled = false;
                button.textContent = `Play ${gameName}`;
            } else if (userData.gameAccess[gameName]) {
                button.disabled = false;
                button.textContent = `Play ${gameName}`;
            } else {
                button.disabled = true;
                button.textContent = 'You don\'t have access to this game';
            }
        }
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    checkLogin();
    updateGameAccess();
}); 
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.toLowerCase();
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    try {
        // In production, this would be an API endpoint
        // For now, we'll use a static object
        const logins = {
            "guest": {
                password: "MD-guest-123!",
                isBetaTester: true,
                allGames: true,
                isGuest: true,
                gameAccess: {}
            },
            "md": {
                password: "MD-123",
                isBetaTester: true,
                allGames: true,
                gameAccess: {
                }
            },
            "milo": {
                password: "12345678",
                allGames: false,
                gameAccess: {
                    "Sudoku": true,
                    "Snake": false,
                    "WhackAMole": false,
                    "Tetris": false,
                    "SpaceShooter": false,
                    "PaperPlane": false,
                    "Memory": false,
                    "DoodleJump": false,
                    "BrickBreaker": false,
                    "TicTacToe": false
                }
            },
            "jay": {
                password: "Jaymm",
                allGames: false,
                expire: "02/04/2025",
                gameAccess: {
                    "Sudoku": false,
                    "Snake": false,
                    "WhackAMole": true,
                    "Tetris": false,
                    "SpaceShooter": false,
                    "PaperPlane": false,
                    "Memory": false,
                    "DoodleJump": false,
                    "BrickBreaker": false,
                    "TicTacToe": false
                }
            },
            "andrew": {
                password: "SunshineApple42",
                expire: "03/06/2025",
                allGames: true,
                gameAccess: {
                    "Sudoku": true,
                    "Snake": true,
                    "WhackAMole": true,
                    "Tetris": true,
                    "SpaceShooter": true,
                    "PaperPlane": true,
                    "Memory": true,
                    "DoodleJump": true,
                    "BrickBreaker": true,
                    "TicTacToe": true
                }
            },
            "sarim": {
                password: "CoffeeHouse99",
                expire: "03/05/2025",
                allGames: true,
                gameAccess: {
                    "Sudoku": true,
                    "Snake": true,
                    "WhackAMole": true,
                    "Tetris": true,
                    "SpaceShooter": true,
                    "PaperPlane": true,
                    "Memory": true,
                    "DoodleJump": true,
                    "BrickBreaker": true,
                    "TicTacToe": true
                }
            },
            "diego": {
                password: "StarryNight58",
                allGames: true,
                gameAccess: {
                    "Sudoku": true,
                    "Snake": true,
                    "WhackAMole": true,
                    "Tetris": true,
                    "SpaceShooter": true,
                    "PaperPlane": true,
                    "Memory": true,
                    "DoodleJump": true,
                    "BrickBreaker": true,
                    "TicTacToe": true
                }
            },
            "rohan": {
                password: "MountainBreeze13",
                allGames: true,
                gameAccess: {
                    "Sudoku": true,
                    "Snake": true,
                    "WhackAMole": true,
                    "Tetris": true,
                    "SpaceShooter": true,
                    "PaperPlane": true,
                    "Memory": true,
                    "DoodleJump": true,
                    "BrickBreaker": true,
                    "TicTacToe": true
                }
            },
            "logan": {
                password: "FlameTumble94",
                expire: "02/05/2025",
                allGames: true,
                gameAccess: {
                    "Sudoku": true,
                    "Snake": true,
                    "WhackAMole": true,
                    "Tetris": true,
                    "SpaceShooter": true,
                    "PaperPlane": true,
                    "Memory": true,
                    "DoodleJump": true,
                    "BrickBreaker": true,
                    "TicTacToe": true
                }
            }
        };
        
        const userEntry = Object.entries(logins).find(([key]) => key === username);
        
        if (userEntry && userEntry[1].password === password) {
            // Check if account has expired
            if (userEntry[1].expire) {
                const [day, month, year] = userEntry[1].expire.split('/');
                const expireDate = new Date(year, month - 1, day); // month is 0-based in Date
                const currentDate = new Date();
                
                if (currentDate > expireDate) {
                    errorMessage.textContent = 'Please renew your account';
                    errorMessage.style.display = 'block';
                    document.getElementById('password').value = '';
                    return;
                }
            }

            sessionStorage.setItem('userData', JSON.stringify({
                username: userEntry[0],
                gameAccess: userEntry[1].gameAccess,
                isBetaTester: userEntry[1].isBetaTester || false,
                allGames: userEntry[1].allGames || false,
                expire: userEntry[1].expire || null,
                isGuest: userEntry[1].isGuest || false
            }));
            
            window.location.href = 'game-selector.html';
        } else {
            errorMessage.textContent = 'Incorrect username or password';
            errorMessage.style.display = 'block';
            document.getElementById('password').value = '';
        }
    } catch (error) {
        console.error('Error during login:', error);
        errorMessage.textContent = 'Error during login. Please try again.';
        errorMessage.style.display = 'block';
    }
}); 
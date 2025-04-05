document.addEventListener("DOMContentLoaded", function () {
    const gameBoard = document.getElementById("gameBoard");
    const endScreen = document.getElementById("endScreen");
    const endTitle = document.getElementById("endTitle");
    const newGameBtn = document.getElementById("newGameBtn");
    const gameSelectorBtn = document.getElementById("gameSelectorBtn");
    const resetScoreBtn = document.getElementById("resetScoreBtn");
    const scoreX = document.getElementById("scoreX");
    const scoreO = document.getElementById("scoreO");
    const aiModeBtn = document.getElementById("aiModeBtn");

    let currentPlayer = "X";
    let gameState = Array(9).fill(null);
    let gameActive = true;
    let isAIMode = false;

    // Load scores from localStorage or initialize
    let scores = JSON.parse(localStorage.getItem("ticTacToeScores")) || {
        X: 0,
        O: 0
    };

    // Initialize the game board
    function initializeBoard() {
        gameBoard.innerHTML = "";
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.index = i;
            cell.addEventListener("click", handleCellClick);
            gameBoard.appendChild(cell);
        }
    }

    // Handle cell click
    function handleCellClick(event) {
        if (!gameActive) return;
        
        const cell = event.target;
        const index = parseInt(cell.dataset.index);
        
        if (gameState[index] !== null) return;
        
        makeMove(index);
        
        if (isAIMode && gameActive) {
            setTimeout(makeAIMove, 500);
        }
    }

    // Make a move
    function makeMove(index) {
        gameState[index] = currentPlayer;
        gameBoard.children[index].textContent = currentPlayer;
        gameBoard.children[index].classList.add(currentPlayer.toLowerCase());
        
        if (checkWin()) {
            gameActive = false;
            scores[currentPlayer]++;
            localStorage.setItem("ticTacToeScores", JSON.stringify(scores));
            updateScores();
            showEndScreen(`Player ${currentPlayer} Wins!`);
            return;
        }
        
        if (checkDraw()) {
            gameActive = false;
            showEndScreen("It's a Draw!");
            return;
        }
        
        currentPlayer = currentPlayer === "X" ? "O" : "X";
    }

    // Make AI move
    function makeAIMove() {
        if (!gameActive) return;

        // Simple AI: Try to win, block opponent's win, or take center
        let move = findBestMove();
        makeMove(move);
    }

    // Find best move for AI
    function findBestMove() {
        // Try to win
        for (let i = 0; i < 9; i++) {
            if (gameState[i] === null) {
                gameState[i] = currentPlayer;
                if (checkWin(false)) {
                    gameState[i] = null;
                    return i;
                }
                gameState[i] = null;
            }
        }

        // Block opponent's win
        const opponent = currentPlayer === "X" ? "O" : "X";
        for (let i = 0; i < 9; i++) {
            if (gameState[i] === null) {
                gameState[i] = opponent;
                if (checkWin(false)) {
                    gameState[i] = null;
                    return i;
                }
                gameState[i] = null;
            }
        }

        // Take center if available
        if (gameState[4] === null) {
            return 4;
        }

        // Take any available corner
        const corners = [0, 2, 6, 8];
        for (let corner of corners) {
            if (gameState[corner] === null) {
                return corner;
            }
        }

        // Take any available edge
        const edges = [1, 3, 5, 7];
        for (let edge of edges) {
            if (gameState[edge] === null) {
                return edge;
            }
        }

        return -1;
    }

    // Check for win
    function checkWin(highlightWinners = true) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];
        
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (gameState[a] && 
                gameState[a] === gameState[b] && 
                gameState[a] === gameState[c]) {
                // Only highlight winning cells if this is a real win, not during AI calculations
                if (highlightWinners) {
                    pattern.forEach(index => {
                        gameBoard.children[index].classList.add("winner");
                    });
                }
                return true;
            }
        }
        return false;
    }

    // Check for draw
    function checkDraw() {
        return gameState.every(cell => cell !== null);
    }

    // Update scores display
    function updateScores() {
        scoreX.textContent = scores.X;
        scoreO.textContent = scores.O;
    }

    // Show end screen
    function showEndScreen(title) {
        endTitle.textContent = title;
        endScreen.style.display = "flex";
    }

    // Start new game
    function startNewGame() {
        gameState = Array(9).fill(null);
        currentPlayer = "X";
        gameActive = true;
        endScreen.style.display = "none";
        
        // Remove winner class from all cells
        const cells = gameBoard.getElementsByClassName("cell");
        Array.from(cells).forEach(cell => {
            cell.classList.remove("winner");
        });
        
        initializeBoard();
    }

    // Reset scores
    function resetScores() {
        scores = { X: 0, O: 0 };
        localStorage.setItem("ticTacToeScores", JSON.stringify(scores));
        updateScores();
        startNewGame();
    }

    // Toggle AI mode
    function toggleAIMode() {
        isAIMode = !isAIMode;
        aiModeBtn.textContent = isAIMode ? "AI Mode: ON" : "AI Mode: OFF";
        aiModeBtn.classList.toggle("active");
        startNewGame();
    }

    // Event listeners
    newGameBtn.addEventListener("click", startNewGame);
    gameSelectorBtn.addEventListener("click", () => {
        window.location.href = "../game-selector.html";
    });
    resetScoreBtn.addEventListener("click", resetScores);
    aiModeBtn.addEventListener("click", toggleAIMode);

    // Initialize scores display
    updateScores();

    // Start the game
    startNewGame();
}); 
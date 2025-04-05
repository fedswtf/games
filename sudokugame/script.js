document.addEventListener("DOMContentLoaded", function () {
    const menuButton = document.getElementById("menuButton");
    const popupOverlay = document.getElementById("popupOverlay");
    const closePopup = document.getElementById("closePopup");
    const difficultyButtons = document.querySelectorAll(".difficultyBtn");
    const sudokuBoard = document.getElementById("sudokuBoard");
    const numberPadButtons = document.querySelectorAll(".numBtn");
    const livesDisplay = document.getElementById("lives");
    const customSlider = document.getElementById("customSlider");
    const customInput = document.getElementById("customInput");
    const customButton = document.getElementById("customButton");
    const endScreen = document.getElementById("endScreen");
    const endTitle = document.getElementById("endTitle");
    const newGameBtn = document.getElementById("newGameBtn");
    const gameSelectorBtn = document.getElementById("gameSelectorBtn");
    const regenerateBtn = document.getElementById("regenerateBtn");

    let board = Array(9).fill().map(() => Array(9).fill(null));
    let solution = Array(9).fill().map(() => Array(9).fill(null));
    let selectedCell = null;
    let lives = 3;
    let currentDifficulty = 40; // Store current difficulty

    // Custom difficulty controls
    customSlider.addEventListener("input", function() {
        customInput.value = this.value;
        customButton.textContent = `Custom (${this.value}%)`;
    });

    customInput.addEventListener("input", function() {
        let value = parseInt(this.value);
        if (isNaN(value)) {
            value = 0;
        }
        // Clamp value between 0 and 99
        value = Math.max(0, Math.min(99, value));
        this.value = value;
        customSlider.value = value;
        customButton.textContent = `Custom (${value}%)`;
    });

    customButton.addEventListener("click", function() {
        const value = parseInt(customInput.value);
        if (!isNaN(value) && value >= 0 && value <= 100) {
            currentDifficulty = value;
            startNewGame(value);
        }
    });

    // Show menu
    menuButton.addEventListener("click", () => {
        popupOverlay.style.display = "flex";
    });

    // Close menu
    closePopup.addEventListener("click", () => {
        popupOverlay.style.display = "none";
    });

    // Difficulty selection
    difficultyButtons.forEach((button) => {
        if (button.id !== "customButton") {  // Skip custom button as it's handled separately
            button.addEventListener("click", function () {
                currentDifficulty = parseInt(this.dataset.difficulty);
                startNewGame(currentDifficulty);
            });
        }
    });

    // End screen button handlers
    newGameBtn.addEventListener("click", () => {
        endScreen.style.display = "none";
        popupOverlay.style.display = "flex";
    });

    gameSelectorBtn.addEventListener("click", () => {
        window.location.href = "../game-selector.html";
    });

    regenerateBtn.addEventListener("click", () => {
        endScreen.style.display = "none";
        startNewGame(currentDifficulty);
    });

    function startNewGame(filledPercentage) {
        popupOverlay.style.display = "none";
        resetLives();
        generateSudoku(filledPercentage);
    }

    function resetLives() {
        lives = 3;
        updateLivesDisplay();
    }

    function updateLivesDisplay() {
        livesDisplay.innerHTML = "❤️".repeat(lives);
        if (lives === 0) {
            showEndScreen("Game Over!");
        }
    }

    function showEndScreen(title) {
        endTitle.textContent = title;
        endScreen.style.display = "flex";
    }

    function checkWin() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] !== solution[row][col]) {
                    return false;
                }
            }
        }
        showEndScreen("Well Done!");
        return true;
    }

    function generateSudoku(filledPercentage) {
        sudokuBoard.innerHTML = "";
        board = Array(9).fill().map(() => Array(9).fill(null));
        solution = generateSolvedBoard();
        let totalCells = 81;
        let cellsToFill = Math.floor((filledPercentage / 100) * totalCells);

        let filledPositions = new Set();
        while (filledPositions.size < cellsToFill) {
            let row = Math.floor(Math.random() * 9);
            let col = Math.floor(Math.random() * 9);
            let posKey = `${row},${col}`;
            if (!filledPositions.has(posKey)) {
                board[row][col] = solution[row][col];
                filledPositions.add(posKey);
            }
        }

        renderBoard();
    }

    function generateSolvedBoard() {
        let newBoard = Array(9).fill().map(() => Array(9).fill(null));
        function solve(board) {
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (board[row][col] === null) {
                        let numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                        for (let num of numbers) {
                            if (isValidPlacement(board, row, col, num)) {
                                board[row][col] = num;
                                if (solve(board)) return true;
                                board[row][col] = null;
                            }
                        }
                        return false;
                    }
                }
            }
            return true;
        }
        solve(newBoard);
        return newBoard;
    }

    function shuffleArray(array) {
        return array.sort(() => Math.random() - 0.5);
    }

    function isValidPlacement(board, row, col, num) {
        for (let i = 0; i < 9; i++) {
            if (board[row][i] === num || board[i][col] === num) return false;
        }
        let startRow = Math.floor(row / 3) * 3;
        let startCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[startRow + i][startCol + j] === num) return false;
            }
        }
        return true;
    }

    function renderBoard() {
        sudokuBoard.innerHTML = "";
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                let cell = document.createElement("div");
                cell.classList.add("cell");
                cell.dataset.row = row;
                cell.dataset.col = col;

                if (board[row][col] !== null) {
                    cell.textContent = board[row][col];
                    cell.classList.add("fixed");
                } else {
                    cell.contentEditable = true;
                    cell.addEventListener("click", () => {
                        if (selectedCell) selectedCell.classList.remove("selected");
                        selectedCell = cell;
                        cell.classList.add("selected");
                    });

                    cell.addEventListener("input", handleCellInput);
                }

                sudokuBoard.appendChild(cell);
            }
        }
    }

    function handleCellInput(event) {
        let cell = event.target;
        let row = parseInt(cell.dataset.row);
        let col = parseInt(cell.dataset.col);
        let value = parseInt(cell.textContent);

        if (isNaN(value) || value < 1 || value > 9) {
            cell.textContent = "";
            return;
        }

        if (solution[row][col] === value) {
            board[row][col] = value;
            cell.classList.add("correct");
            if (checkWin()) return;
        } else {
            lives--;
            updateLivesDisplay();
            cell.textContent = ""; // Prevent showing the incorrect number
        }
    }

    numberPadButtons.forEach(button => {
        button.addEventListener("click", function () {
            if (selectedCell) {
                let row = parseInt(selectedCell.dataset.row);
                let col = parseInt(selectedCell.dataset.col);
                let value = parseInt(button.textContent);

                if (solution[row][col] === value) {
                    board[row][col] = value;
                    selectedCell.textContent = value;
                    selectedCell.classList.add("correct");
                    selectedCell.classList.remove("fixed");
                    if (checkWin()) return;
                } else {
                    lives--;
                    updateLivesDisplay();
                }
            }
        });
    });

    // Start with a default game
    startNewGame(40); // Medium difficulty
});

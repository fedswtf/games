// Canvas setup
const canvas = document.getElementById('gameCanvas');
const holdCanvas = document.getElementById('holdCanvas');
const nextCanvas = document.getElementById('nextCanvas');
const ctx = canvas.getContext('2d');
const holdCtx = holdCanvas.getContext('2d');
const nextCtx = nextCanvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOver');

// Set canvas sizes
canvas.width = 300;
canvas.height = 600;
holdCanvas.width = 120;
holdCanvas.height = 120;
nextCanvas.width = 120;
nextCanvas.height = 120;

// Game constants
const BLOCK_SIZE = 30;
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const COLORS = {
    'I': '#00f0f0',
    'O': '#f0f000',
    'T': '#a000f0',
    'S': '#00f000',
    'Z': '#f00000',
    'J': '#0000f0',
    'L': '#f0a000',
    'GHOST': 'rgba(255, 255, 255, 0.2)'
};

// Tetromino shapes
const SHAPES = {
    'I': [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
    'O': [[1,1], [1,1]],
    'T': [[0,1,0], [1,1,1], [0,0,0]],
    'S': [[0,1,1], [1,1,0], [0,0,0]],
    'Z': [[1,1,0], [0,1,1], [0,0,0]],
    'J': [[1,0,0], [1,1,1], [0,0,0]],
    'L': [[0,0,1], [1,1,1], [0,0,0]]
};

// Game variables
let grid = Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(0));
let score = 0;
let level = 1;
let lines = 0;
let currentPiece = null;
let nextPiece = null;
let holdPiece = null;
let canHold = true;
let isGameOver = true;
let dropCounter = 0;
let lastTime = 0;
let dropInterval = 1000;
let animationFrameId = null;

class Piece {
    constructor(type) {
        this.type = type;
        this.shape = SHAPES[type];
        this.color = COLORS[type];
        this.x = Math.floor(GRID_WIDTH / 2) - Math.floor(this.shape[0].length / 2);
        this.y = 0;
        this.rotation = 0;
    }

    rotate() {
        const newShape = this.shape[0].map((_, i) => 
            this.shape.map(row => row[i]).reverse()
        );
        
        if (!checkCollision(this.x, this.y, newShape)) {
            this.shape = newShape;
            this.rotation = (this.rotation + 1) % 4;
        }
    }
}

function createPiece() {
    const types = Object.keys(SHAPES);
    return new Piece(types[Math.floor(Math.random() * types.length)]);
}

function checkCollision(x, y, shape) {
    for(let row = 0; row < shape.length; row++) {
        for(let col = 0; col < shape[row].length; col++) {
            if(shape[row][col] !== 0) {
                const newX = x + col;
                const newY = y + row;
                if(newX < 0 || newX >= GRID_WIDTH || 
                   newY >= GRID_HEIGHT ||
                   (newY >= 0 && grid[newY][newX])) {
                    return true;
                }
            }
        }
    }
    return false;
}

function merge() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value !== 0) {
                const newY = currentPiece.y + y;
                if(newY >= 0) {
                    grid[newY][currentPiece.x + x] = currentPiece.type;
                }
            }
        });
    });
}

function clearLines() {
    let linesCleared = 0;
    for(let y = GRID_HEIGHT - 1; y >= 0; y--) {
        if(grid[y].every(value => value !== 0)) {
            grid.splice(y, 1);
            grid.unshift(Array(GRID_WIDTH).fill(0));
            linesCleared++;
            y++;
        }
    }
    if(linesCleared > 0) {
        lines += linesCleared;
        score += linesCleared * 100 * level;
        level = Math.floor(lines / 10) + 1;
        dropInterval = Math.max(100, 1000 - (level - 1) * 100);
        
        document.getElementById('score').textContent = score;
        document.getElementById('level').textContent = level;
        document.getElementById('lines').textContent = lines;
    }
}

function getGhostPosition() {
    let ghostY = currentPiece.y;
    while(!checkCollision(currentPiece.x, ghostY + 1, currentPiece.shape)) {
        ghostY++;
    }
    return ghostY;
}

function draw() {
    // Clear canvas
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--grid-color');
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    for(let i = 0; i <= GRID_WIDTH; i++) {
        ctx.beginPath();
        ctx.moveTo(i * BLOCK_SIZE, 0);
        ctx.lineTo(i * BLOCK_SIZE, canvas.height);
        ctx.stroke();
    }
    for(let i = 0; i <= GRID_HEIGHT; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * BLOCK_SIZE);
        ctx.lineTo(canvas.width, i * BLOCK_SIZE);
        ctx.stroke();
    }

    // Draw placed pieces
    grid.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value !== 0) {
                ctx.fillStyle = COLORS[value];
                ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
            }
        });
    });

    // Draw ghost piece
    if(currentPiece) {
        const ghostY = getGhostPosition();
        ctx.fillStyle = COLORS.GHOST;
        currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if(value !== 0) {
                    ctx.fillRect(
                        (currentPiece.x + x) * BLOCK_SIZE,
                        (ghostY + y) * BLOCK_SIZE,
                        BLOCK_SIZE - 1,
                        BLOCK_SIZE - 1
                    );
                }
            });
        });
    }

    // Draw current piece
    if(currentPiece) {
        ctx.fillStyle = currentPiece.color;
        currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if(value !== 0) {
                    ctx.fillRect(
                        (currentPiece.x + x) * BLOCK_SIZE,
                        (currentPiece.y + y) * BLOCK_SIZE,
                        BLOCK_SIZE - 1,
                        BLOCK_SIZE - 1
                    );
                }
            });
        });
    }

    // Draw hold piece
    holdCtx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--grid-color');
    holdCtx.fillRect(0, 0, holdCanvas.width, holdCanvas.height);
    if(holdPiece) {
        holdCtx.fillStyle = COLORS[holdPiece.type];
        const offsetX = (holdCanvas.width - holdPiece.shape[0].length * 20) / 2;
        const offsetY = (holdCanvas.height - holdPiece.shape.length * 20) / 2;
        holdPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if(value !== 0) {
                    holdCtx.fillRect(
                        offsetX + x * 20,
                        offsetY + y * 20,
                        19,
                        19
                    );
                }
            });
        });
    }

    // Draw next piece
    nextCtx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--grid-color');
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    if(nextPiece) {
        nextCtx.fillStyle = COLORS[nextPiece.type];
        const offsetX = (nextCanvas.width - nextPiece.shape[0].length * 20) / 2;
        const offsetY = (nextCanvas.height - nextPiece.shape.length * 20) / 2;
        nextPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if(value !== 0) {
                    nextCtx.fillRect(
                        offsetX + x * 20,
                        offsetY + y * 20,
                        19,
                        19
                    );
                }
            });
        });
    }
}

function update(time = 0) {
    if(isGameOver) return;

    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;

    if(dropCounter > dropInterval) {
        if(!checkCollision(currentPiece.x, currentPiece.y + 1, currentPiece.shape)) {
            currentPiece.y++;
        } else {
            merge();
            clearLines();
            if(checkCollision(nextPiece.x, nextPiece.y, nextPiece.shape)) {
                gameOver();
                return;
            }
            currentPiece = nextPiece;
            nextPiece = createPiece();
            canHold = true;
        }
        dropCounter = 0;
    }

    draw();
    animationFrameId = requestAnimationFrame(update);
}

function startGame() {
    // Reset game state
    grid = Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(0));
    score = 0;
    level = 1;
    lines = 0;
    dropInterval = 1000;
    isGameOver = false;
    canHold = true;
    holdPiece = null;
    
    document.getElementById('score').textContent = '0';
    document.getElementById('level').textContent = '1';
    document.getElementById('lines').textContent = '0';
    
    currentPiece = createPiece();
    nextPiece = createPiece();
    
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    
    if(animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    update();
}

function gameOver() {
    isGameOver = true;
    if(animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalLevel').textContent = level;
    gameOverScreen.style.display = 'block';
}

function hardDrop() {
    while(!checkCollision(currentPiece.x, currentPiece.y + 1, currentPiece.shape)) {
        currentPiece.y++;
        score += 2;
    }
    document.getElementById('score').textContent = score;
}

function holdCurrentPiece() {
    if(!canHold) return;
    
    const temp = currentPiece;
    if(holdPiece === null) {
        holdPiece = new Piece(temp.type);
        currentPiece = nextPiece;
        nextPiece = createPiece();
    } else {
        currentPiece = new Piece(holdPiece.type);
        holdPiece = new Piece(temp.type);
    }
    canHold = false;
}

// Movement functions
function moveLeft() {
    if(!checkCollision(currentPiece.x - 1, currentPiece.y, currentPiece.shape)) {
        currentPiece.x--;
        draw();
    }
}

function moveRight() {
    if(!checkCollision(currentPiece.x + 1, currentPiece.y, currentPiece.shape)) {
        currentPiece.x++;
        draw();
    }
}

function moveDown() {
    if(!checkCollision(currentPiece.x, currentPiece.y + 1, currentPiece.shape)) {
        currentPiece.y++;
        score += 1;
        document.getElementById('score').textContent = score;
        draw();
    }
}

function rotate() {
    const newShape = currentPiece.shape[0].map((_, i) => 
        currentPiece.shape.map(row => row[i]).reverse()
    );
    
    if(!checkCollision(currentPiece.x, currentPiece.y, newShape)) {
        currentPiece.shape = newShape;
        currentPiece.rotation = (currentPiece.rotation + 1) % 4;
        draw();
    }
}

// Event listeners
document.addEventListener('keydown', function(event) {
    if (!isGameOver) {
        switch(event.key.toLowerCase()) {
            case 'arrowleft':
            case 'a':
                moveLeft();
                break;
            case 'arrowright':
            case 'd':
                moveRight();
                break;
            case 'arrowdown':
                moveDown();
                break;
            case 'arrowup':
                rotate();
                break;
            case ' ':
                hardDrop();
                break;
            case 'c':
                holdCurrentPiece();
                break;
        }
    }
});

document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('restartButton').addEventListener('click', startGame);

// Initial draw
draw(); 
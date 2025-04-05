// Authentication and access control
function checkAuth() {
    const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
    const isBetaTester = userData.isBetaTester || false;
    const allGames = userData.allGames || false;
    const gameAccess = userData.gameAccess || {};
    
    // If user has allGames flag, they have access to all non-beta games
    if (allGames) {
        return true;
    }
    
    // If user is a beta tester, check for beta.js
    if (isBetaTester) {
        return true; // Beta testers have access to all beta games
    }
    
    // Check if the game exists in gameAccess and is true
    return gameAccess['Pong'] === true;
}

// Only proceed with game initialization if authentication and access checks pass
if (!checkAuth()) {
    // Stop execution if checks fail
    window.location.href = '../game-selector.html';
    throw new Error('Authentication or access check failed');
}

// Game constants
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH = 20;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 15;
const PADDLE_SPEED = 8;
const BALL_SPEED = 7;
const AI_SPEEDS = {
    easy: 4,
    medium: 6,
    hard: 8
};

// Game state
let canvas, ctx;
let gameLoop;
let score = { player1: 0, player2: 0 };
let gameMode = null;
let aiDifficulty = null;

// Game objects
const ball = {
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    dx: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
    dy: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
    size: BALL_SIZE
};

const player1 = {
    x: 50,
    y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0,
    color: '#00ffff'
};

const player2 = {
    x: CANVAS_WIDTH - 50 - PADDLE_WIDTH,
    y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0,
    color: '#ff00ff'
};

// Initialize game
function init() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    
    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
}

// Menu functions
function showDifficultyMenu() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('difficulty-menu').style.display = 'block';
}

function hideDifficultyMenu() {
    document.getElementById('menu').style.display = 'block';
    document.getElementById('difficulty-menu').style.display = 'none';
}

function startGame(difficulty) {
    gameMode = 'ai';
    aiDifficulty = difficulty;
    document.getElementById('difficulty-menu').style.display = 'none';
    document.getElementById('new-game').style.display = 'block';
    document.getElementById('game-selector').style.display = 'block';
    startGameLoop();
}

function startTwoPlayer() {
    gameMode = 'two-player';
    document.getElementById('menu').style.display = 'none';
    document.getElementById('new-game').style.display = 'block';
    document.getElementById('game-selector').style.display = 'block';
    startGameLoop();
}

function newGame() {
    // Stop the game loop
    if (gameLoop) {
        clearInterval(gameLoop);
        gameLoop = null;
    }

    // Reset game state
    score = { player1: 0, player2: 0 };
    gameMode = null;
    aiDifficulty = null;

    // Reset ball position
    ball.x = CANVAS_WIDTH / 2;
    ball.y = CANVAS_HEIGHT / 2;
    ball.dx = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);

    // Reset paddle positions
    player1.y = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
    player2.y = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
    player1.dy = 0;
    player2.dy = 0;

    // Update display
    document.getElementById('score').textContent = '0 - 0';
    document.getElementById('new-game').style.display = 'none';
    document.getElementById('game-selector').style.display = 'none';
    document.getElementById('menu').style.display = 'block';
}

// Game loop
function startGameLoop() {
    if (gameLoop) return;
    gameLoop = setInterval(update, 1000 / 60);
}

function update() {
    // Update paddle positions
    player1.y += player1.dy;
    player2.y += player2.dy;

    // Keep paddles in bounds
    player1.y = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, player1.y));
    player2.y = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, player2.y));

    // AI movement
    if (gameMode === 'ai') {
        const aiSpeed = AI_SPEEDS[aiDifficulty];
        const targetY = ball.y - PADDLE_HEIGHT / 2;
        
        if (Math.abs(player2.y - targetY) > aiSpeed) {
            player2.dy = player2.y < targetY ? aiSpeed : -aiSpeed;
        } else {
            player2.dy = 0;
        }
    }

    // Update ball position
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom
    if (ball.y <= 0 || ball.y >= CANVAS_HEIGHT - ball.size) {
        ball.dy *= -1;
        createParticles(ball.x, ball.y);
    }

    // Ball collision with paddles
    if (checkCollision(ball, player1) || checkCollision(ball, player2)) {
        ball.dx *= -1;
        createParticles(ball.x, ball.y);
    }

    // Score points
    if (ball.x <= 0) {
        score.player2++;
        resetBall();
    } else if (ball.x >= CANVAS_WIDTH - ball.size) {
        score.player1++;
        resetBall();
    }

    // Update score display
    document.getElementById('score').textContent = `${score.player1} - ${score.player2}`;

    // Draw everything
    draw();
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw center line
    ctx.setLineDash([5, 15]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.strokeStyle = '#333';
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw paddles
    drawPaddle(player1);
    drawPaddle(player2);

    // Draw ball
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ball.x + ball.size / 2, ball.y + ball.size / 2, ball.size / 2, 0, Math.PI * 2);
    ctx.fill();
}

function drawPaddle(paddle) {
    ctx.fillStyle = paddle.color;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    
    // Add glow effect
    ctx.shadowColor = paddle.color;
    ctx.shadowBlur = 20;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowBlur = 0;
}

function checkCollision(ball, paddle) {
    return ball.x < paddle.x + paddle.width &&
           ball.x + ball.size > paddle.x &&
           ball.y < paddle.y + paddle.height &&
           ball.y + ball.size > paddle.y;
}

function resetBall() {
    ball.x = CANVAS_WIDTH / 2;
    ball.y = CANVAS_HEIGHT / 2;
    ball.dx = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
}

function handleKeyDown(e) {
    switch(e.key) {
        case 'w':
            player1.dy = -PADDLE_SPEED;
            break;
        case 's':
            player1.dy = PADDLE_SPEED;
            break;
        case 'ArrowUp':
            if (gameMode === 'two-player') {
                player2.dy = -PADDLE_SPEED;
            }
            break;
        case 'ArrowDown':
            if (gameMode === 'two-player') {
                player2.dy = PADDLE_SPEED;
            }
            break;
    }
}

function handleKeyUp(e) {
    switch(e.key) {
        case 'w':
        case 's':
            if (player1.dy < 0 && e.key === 'w' || player1.dy > 0 && e.key === 's') {
                player1.dy = 0;
            }
            break;
        case 'ArrowUp':
        case 'ArrowDown':
            if (gameMode === 'two-player' && 
                (player2.dy < 0 && e.key === 'ArrowUp' || player2.dy > 0 && e.key === 'ArrowDown')) {
                player2.dy = 0;
            }
            break;
    }
}

function createParticles(x, y) {
    for (let i = 0; i < 5; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = Math.random() * 5 + 2 + 'px';
        particle.style.height = particle.style.width;
        
        document.getElementById('game-container').appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 1000);
    }
}

// Initialize the game when the page loads
window.onload = init; 
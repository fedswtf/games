// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOver');
const winScreen = document.getElementById('winScreen');
const powerUpIndicator = document.getElementById('powerUpIndicator');
const startButton = document.getElementById('start-btn');
const restartButton = document.getElementById('play-again');
const playAgainButton = document.getElementById('play-again-win');

// Set canvas size
canvas.width = 800;
canvas.height = 500;

// Game variables
let score = 0;
let lives = 3;
let highScore = 0;
let isGameOver = true;
let animationFrameId = null;
let lastPowerUpUpdate = 0;
let activePowerUps = {
    wide: { active: false, timer: 0 },
    slow: { active: false, timer: 0 },
    multi: { active: false, timer: 0 }
};

// Paddle properties
const paddle = {
    width: 100,
    height: 15,
    x: canvas.width / 2 - 50,
    y: canvas.height - 40,
    speed: 8,
    dx: 0
};

// Ball properties
const ball = {
    x: canvas.width / 2,
    y: canvas.height - 60,
    size: 10,
    speed: 5,
    dx: 4,
    dy: -4
};

// Add balls array to store multiple balls
let balls = [];

function createBall(x, y, dx, dy) {
    return {
        x: x,
        y: y,
        size: 10,
        speed: 5,
        dx: dx,
        dy: dy
    };
}

// Brick properties
const brickRowCount = 4;
const brickColumnCount = 8;
const brickWidth = 80;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 120;
const brickOffsetLeft = (canvas.width - (brickColumnCount * (brickWidth + brickPadding))) / 2;

// Create bricks array
let bricks = [];
function createBricks() {
    bricks = [];
    for(let r = 0; r < brickRowCount; r++) {
        bricks[r] = [];
        for(let c = 0; c < brickColumnCount; c++) {
            const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
            const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
            bricks[r][c] = { 
                x: brickX, 
                y: brickY, 
                status: 1,
                color: `hsl(${360 * r / brickRowCount}, 70%, 60%)`
            };
        }
    }
}

// Power-up class
class PowerUp {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 15;
        this.speed = 2;
        this.types = ['wide', 'slow', 'multi'];
        this.type = this.types[Math.floor(Math.random() * this.types.length)];
        this.color = this.type === 'wide' ? '#3498db' : 
                    this.type === 'slow' ? '#2ecc71' : '#e74c3c';
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    update() {
        this.y += this.speed;
    }
}

let powerUps = [];

function activatePowerUp(type) {
    activePowerUps[type].active = true;
    activePowerUps[type].timer = 600; // 10 seconds

    switch(type) {
        case 'wide':
            paddle.width = 150;
            break;
        case 'slow':
            balls.forEach(ball => {
                ball.speed = 3;
                ball.dx = ball.dx > 0 ? 3 : -3;
                ball.dy = ball.dy > 0 ? 3 : -3;
            });
            break;
        case 'multi':
            // Create two additional balls with different angles
            const mainBall = balls[0];
            balls.push(
                createBall(mainBall.x, mainBall.y, -mainBall.speed, -mainBall.speed),
                createBall(mainBall.x, mainBall.y, mainBall.speed, -mainBall.speed)
            );
            break;
    }

    updatePowerUpDisplay();
}

function deactivatePowerUp(type) {
    activePowerUps[type].active = false;
    activePowerUps[type].timer = 0;
    
    switch(type) {
        case 'wide':
            paddle.width = 100;
            break;
        case 'slow':
            balls.forEach(ball => {
                ball.speed = 5;
                ball.dx = ball.dx > 0 ? 4 : -4;
                ball.dy = ball.dy > 0 ? 4 : -4;
            });
            break;
    }
    
    updatePowerUpDisplay();
}

function updatePowerUpDisplay() {
    const activePowerUpsList = Object.entries(activePowerUps)
        .filter(([_, powerUp]) => powerUp.active)
        .map(([type, powerUp]) => {
            const seconds = Math.ceil(powerUp.timer / 60);
            const tenths = Math.ceil((powerUp.timer % 60) / 6);
            return `${type.toUpperCase()}: ${seconds}.${tenths}s`;
        });

    if (activePowerUpsList.length > 0) {
        powerUpIndicator.textContent = activePowerUpsList.join(' | ');
        powerUpIndicator.style.display = 'block';
    } else {
        powerUpIndicator.style.display = 'none';
    }
}

function updatePowerUps() {
    const currentTime = Date.now();
    if (currentTime - lastPowerUpUpdate >= 100) { // Update every 100ms
        Object.entries(activePowerUps).forEach(([type, powerUp]) => {
            if (powerUp.active) {
                powerUp.timer -= 6; // Decrement by 6 every 100ms (60 frames per second * 10 seconds = 600)
                if (powerUp.timer <= 0) {
                    deactivatePowerUp(type);
                }
            }
        });
        lastPowerUpUpdate = currentTime;
        updatePowerUpDisplay();
    }
}

// Draw functions
function drawBall() {
    balls.forEach(ball => {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--ball-color');
        ctx.fill();
        ctx.closePath();
    });
}

function drawPaddle() {
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 5);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--paddle-color');
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for(let r = 0; r < brickRowCount; r++) {
        for(let c = 0; c < brickColumnCount; c++) {
            if(bricks[r][c].status === 1) {
                ctx.beginPath();
                ctx.roundRect(bricks[r][c].x, bricks[r][c].y, brickWidth, brickHeight, 5);
                ctx.fillStyle = bricks[r][c].color;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// Collision detection
function ballWallCollision(ball) {
    // Wall collisions
    if(ball.x + ball.dx > canvas.width - ball.size || ball.x + ball.dx < ball.size) {
        ball.dx = -ball.dx;
    }
    if(ball.y + ball.dy < ball.size) {
        ball.dy = -ball.dy;
    }
    
    // Floor collision - more precise check
    if(ball.y + ball.size + ball.dy > canvas.height) {
        return true; // Ball is lost
    }
    return false;
}

function ballPaddleCollision(ball) {
    if(ball.y + ball.dy > paddle.y - ball.size &&
       ball.x > paddle.x &&
       ball.x < paddle.x + paddle.width) {
        ball.dy = -ball.speed;
        // Adjust angle based on where ball hits paddle
        const hitPoint = (ball.x - (paddle.x + paddle.width/2)) / (paddle.width/2);
        ball.dx = hitPoint * ball.speed;
    }
}

function ballBrickCollision(ball) {
    for(let r = 0; r < brickRowCount; r++) {
        for(let c = 0; c < brickColumnCount; c++) {
            const brick = bricks[r][c];
            if(brick.status === 1) {
                if(ball.x > brick.x &&
                   ball.x < brick.x + brickWidth &&
                   ball.y > brick.y &&
                   ball.y < brick.y + brickHeight) {
                    ball.dy = -ball.dy;
                    brick.status = 0;
                    score += 10;
                    document.getElementById('score').textContent = score;
                    
                    // Spawn power-up with 20% chance
                    if(Math.random() < 0.2) {
                        powerUps.push(new PowerUp(brick.x + brickWidth/2, brick.y + brickHeight/2));
                    }

                    // Check if all bricks are broken
                    let remainingBricks = 0;
                    for(let row = 0; row < brickRowCount; row++) {
                        for(let col = 0; col < brickColumnCount; col++) {
                            if(bricks[row][col].status === 1) {
                                remainingBricks++;
                            }
                        }
                    }
                    
                    if(remainingBricks === 0) {
                        showWinScreen();
                        return;
                    }
                }
            }
        }
    }
}

function movePaddle() {
    if(paddle.x + paddle.dx > 0 && paddle.x + paddle.width + paddle.dx < canvas.width) {
        paddle.x += paddle.dx;
    }
}

function resetBall() {
    balls = [createBall(canvas.width / 2, canvas.height - 50, 4, -4)];
}

function update() {
    if(isGameOver) return;

    movePaddle();
    
    // Update all balls
    balls = balls.filter(ball => {
        // Move ball
        ball.x += ball.dx;
        ball.y += ball.dy;

        // Check collisions
        const isLost = ballWallCollision(ball);
        if(isLost) {
            return false;
        }

        ballPaddleCollision(ball);
        ballBrickCollision(ball);
        return true;
    });

    // Update power-ups
    powerUps = powerUps.filter(powerUp => {
        powerUp.update();
        
        // Check collision with paddle
        if(powerUp.y + powerUp.size > paddle.y &&
           powerUp.x > paddle.x &&
           powerUp.x < paddle.x + paddle.width) {
            activatePowerUp(powerUp.type);
            return false;
        }
        
        // Remove if fallen off screen
        return powerUp.y < canvas.height;
    });

    // Check if all balls are lost
    if(balls.length === 0) {
        lives--;
        document.getElementById('lives').textContent = lives;
        if(lives === 0) {
            gameOver();
        } else {
            resetBall();
        }
    }

    updatePowerUps();
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBricks();
    drawBall();
    drawPaddle();
    
    // Draw power-ups
    powerUps.forEach(powerUp => powerUp.draw());
}

function gameLoop() {
    if(!isGameOver) {
        update();
        draw();
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}

function startGame() {
    if(animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }

    // Reset game state
    score = 0;
    lives = 3;
    isGameOver = false;
    powerUps = [];
    lastPowerUpUpdate = Date.now();
    activePowerUps = {
        wide: { active: false, timer: 0 },
        slow: { active: false, timer: 0 },
        multi: { active: false, timer: 0 }
    };
    
    document.getElementById('score').textContent = '0';
    document.getElementById('lives').textContent = '3';
    
    // Reset paddle and balls
    paddle.x = canvas.width / 2 - paddle.width / 2;
    resetBall();
    
    // Create bricks
    createBricks();
    
    // Hide all screens
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    winScreen.style.display = 'none';
    
    // Start game loop
    gameLoop();
}

function gameOver() {
    isGameOver = true;
    if(animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    if(score > highScore) {
        highScore = score;
        document.getElementById('highScore').textContent = highScore;
    }
    document.getElementById('final-score').textContent = score;
    document.getElementById('finalHighScore').textContent = highScore;
    gameOverScreen.style.display = 'block';
}

function showWinScreen() {
    isGameOver = true;
    if(animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    if(score > highScore) {
        highScore = score;
        document.getElementById('highScore').textContent = highScore;
    }
    document.getElementById('win-score').textContent = score;
    document.getElementById('winHighScore').textContent = highScore;
    winScreen.style.display = 'block';
}

// Event listeners
document.addEventListener('keydown', e => {
    if(e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        paddle.dx = -paddle.speed;
    }
    if(e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        paddle.dx = paddle.speed;
    }
});

document.addEventListener('keyup', e => {
    if((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && paddle.dx < 0) {
        paddle.dx = 0;
    }
    if((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && paddle.dx > 0) {
        paddle.dx = 0;
    }
});

canvas.addEventListener('mousemove', e => {
    const relativeX = e.clientX - canvas.offsetLeft;
    if(relativeX > 0 && relativeX < canvas.width) {
        paddle.x = relativeX - paddle.width / 2;
    }
});

// Add click handlers for buttons
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);
playAgainButton.addEventListener('click', startGame);

// Initial draw
createBricks();
draw(); 
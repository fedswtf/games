const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOver');
const startButton = document.getElementById('start-btn');
const restartButton = document.getElementById('play-again');
const gameContainer = document.getElementById('game-container');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Game variables
let score = 0;
let highScore = 0;
let isGameOver = true;
let animationFrameId = null;
let obstacles = [];
let powerUpItems = [];
let clouds = [];

// Power-up states
let shieldTime = 0;
let slowTime = 0;

// Player object
const player = {
    x: 150,
    y: canvas.height / 2,
    width: 40,
    height: 20,
    velocity: 0,
    gravity: 0.35,
    lift: -6,
    invincible: false
};

// Obstacle class
class Obstacle {
    constructor() {
        this.spacing = 150;
        this.top = Math.random() * (canvas.height - this.spacing - 100) + 50;
        this.bottom = this.top + this.spacing;
        this.x = canvas.width;
        this.width = 60;
        this.baseSpeed = 1.5;
        this.speed = this.baseSpeed;
        this.scored = false;
    }

    draw() {
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--obstacle-color');
        ctx.fillRect(this.x, 0, this.width, this.top);
        ctx.fillRect(this.x, this.bottom, this.width, canvas.height - this.bottom);
    }

    update() {
        this.x -= this.speed;
        if (!this.scored && this.x < player.x) {
            score++;
            document.getElementById('score').textContent = score;
            this.scored = true;
        }
    }
}

// Cloud class for background
class Cloud {
    constructor() {
        this.x = canvas.width;
        this.y = Math.random() * canvas.height/2;
        this.width = 60 + Math.random() * 40;
        this.height = 30 + Math.random() * 20;
        this.speed = 1 + Math.random();
    }

    draw() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width/3, 0, Math.PI * 2);
        ctx.arc(this.x + this.width/3, this.y - this.height/4, this.width/3, 0, Math.PI * 2);
        ctx.arc(this.x + this.width/2, this.y, this.width/3, 0, Math.PI * 2);
        ctx.fill();
    }

    update() {
        this.x -= this.speed;
    }
}

function drawPlayer() {
    ctx.save();
    ctx.translate(player.x + player.width/2, player.y + player.height/2);
    ctx.rotate(player.velocity * 0.05);
    ctx.translate(-(player.x + player.width/2), -(player.y + player.height/2));

    ctx.fillStyle = player.invincible ? 'rgba(255, 215, 0, 0.8)' : getComputedStyle(document.documentElement).getPropertyValue('--plane-color');
    ctx.beginPath();
    ctx.moveTo(player.x, player.y + player.height/2);
    ctx.lineTo(player.x + player.width, player.y + player.height/2);
    ctx.lineTo(player.x + player.width/2, player.y);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y;
}

function createPowerUpIndicators() {
    // Remove any existing indicators
    const existing = document.querySelector('.power-up-container');
    if (existing) existing.remove();

    // Create container
    const container = document.createElement('div');
    container.className = 'power-up-container';
    
    // Create shield indicator
    const shield = document.createElement('div');
    shield.className = 'power-up-indicator';
    shield.id = 'shield';
    shield.innerHTML = '🛡️ Shield: <span>0.00s</span>';
    container.appendChild(shield);
    
    // Create slow time indicator
    const slow = document.createElement('div');
    slow.className = 'power-up-indicator';
    slow.id = 'slow';
    slow.innerHTML = '⏰ Slow Time: <span>0.00s</span>';
    container.appendChild(slow);
    
    document.body.appendChild(container);
}

function updatePowerUpDisplay() {
    const shieldDisplay = document.querySelector('#shield span');
    const slowDisplay = document.querySelector('#slow span');
    
    if (shieldDisplay) shieldDisplay.textContent = shieldTime.toFixed(2) + 's';
    if (slowDisplay) slowDisplay.textContent = slowTime.toFixed(2) + 's';
    
    // Update visibility
    document.getElementById('shield').style.display = shieldTime > 0 ? 'flex' : 'none';
    document.getElementById('slow').style.display = slowTime > 0 ? 'flex' : 'none';
}

function activatePowerUp(type) {
    if (type === 'shield') {
        shieldTime += 5;
        player.invincible = true;
    } else if (type === 'slowTime') {
        slowTime += 15;
        obstacles.forEach(obs => {
            obs.speed = obs.baseSpeed * 0.4;
        });
    }
    updatePowerUpDisplay();
}

function updatePowerUps() {
    // Update timers (60 frames per second, so 1/60 ≈ 0.0167 per frame)
    if (shieldTime > 0) {
        shieldTime -= 0.0167;
        if (shieldTime <= 0) {
            shieldTime = 0;
            player.invincible = false;
        }
    }
    
    if (slowTime > 0) {
        slowTime -= 0.0167;
        if (slowTime <= 0) {
            slowTime = 0;
            obstacles.forEach(obs => {
                obs.speed = obs.baseSpeed;
            });
        }
    }
    
    updatePowerUpDisplay();
    
    // Update power-up items
    for (let i = powerUpItems.length - 1; i >= 0; i--) {
        const powerUp = powerUpItems[i];
        powerUp.x -= powerUp.speed;
        
        if (checkCollision(player, powerUp)) {
            activatePowerUp(powerUp.type);
            powerUpItems.splice(i, 1);
        }
        
        if (powerUp.x + powerUp.width < 0) {
            powerUpItems.splice(i, 1);
        }
    }
}

function spawnPowerUp() {
    const powerUpTypes = ['shield', 'slowTime'];
    const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
    
    const powerUp = {
        x: canvas.width + 50,
        y: Math.random() * (canvas.height - 50),
        width: 30,
        height: 30,
        type: randomType,
        speed: 3
    };
    
    powerUpItems.push(powerUp);
}

function drawPowerUps() {
    powerUpItems.forEach(powerUp => {
        ctx.fillStyle = powerUp.type === 'shield' ? '#3498db' : '#9b59b6';
        ctx.beginPath();
        ctx.arc(powerUp.x + powerUp.width/2, powerUp.y + powerUp.height/2, powerUp.width/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.fillText(powerUp.type === 'shield' ? '🛡️' : '⏰', powerUp.x + 5, powerUp.y + 22);
    });
}

function update() {
    if (isGameOver) {
        return;
    }

    player.velocity += player.gravity;
    player.y += player.velocity;

    // Update clouds
    clouds = clouds.filter(cloud => {
        cloud.update();
        return cloud.x > -cloud.width;
    });

    if (clouds.length < 5) {
        clouds.push(new Cloud());
    }

    // Spawn obstacles closer together (reduced from 450 to 300)
    if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < canvas.width - 300) {
        obstacles.push(new Obstacle());
    }

    // Spawn power-ups randomly
    if (Math.random() < 0.01) {
        spawnPowerUp();
    }

    obstacles = obstacles.filter(obs => {
        obs.update();
        return obs.x > -obs.width;
    });

    updatePowerUps();

    if (!player.invincible) {
        for (let obs of obstacles) {
            if (player.x + player.width > obs.x && 
                player.x < obs.x + obs.width && 
                (player.y < obs.top || player.y + player.height > obs.bottom)) {
                gameOver();
                return;
            }
        }
    }

    if (player.y > canvas.height - player.height - 10 || player.y < 0) {
        gameOver();
        return;
    }

    draw();
    animationFrameId = requestAnimationFrame(update);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw clouds
    clouds.forEach(cloud => cloud.draw());

    // Draw obstacles
    obstacles.forEach(obs => obs.draw());

    // Draw power-ups
    drawPowerUps();

    // Draw player
    drawPlayer();
}

function startGame() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }

    score = 0;
    obstacles = [];
    powerUpItems = [];
    isGameOver = false;
    shieldTime = 0;
    slowTime = 0;

    player.y = canvas.height / 2;
    player.velocity = 0;
    player.invincible = false;

    document.getElementById('score').textContent = '0';
    document.getElementById('high-score').textContent = highScore;

    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';

    // Create clouds
    clouds = [];
    for (let i = 0; i < 5; i++) {
        clouds.push(new Cloud());
    }

    // Create power-up indicators
    createPowerUpIndicators();

    // Start the game loop
    update();
}

function gameOver() {
    isGameOver = true;
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }

    if (score > highScore) {
        highScore = score;
        document.getElementById('high-score').textContent = highScore;
    }

    document.getElementById('final-score').textContent = score;
    gameOverScreen.style.display = 'block';
    draw(); // Draw one final frame
}

function jump() {
    if (!isGameOver) {
        player.velocity = player.lift;
    }
}

// Event listeners
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        event.preventDefault();
        jump();
    }
});

canvas.addEventListener('click', jump);
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

// Initial draw
draw();

function createObstacle() {
    const obstacle = document.createElement('div');
    obstacle.className = 'obstacle';
    const topPosition = Math.random() * (gameContainer.offsetHeight - 30);
    obstacle.style.top = `${topPosition}px`;
    gameContainer.appendChild(obstacle);
    return obstacle;
}

function createPowerUp() {
    const powerUp = document.createElement('div');
    powerUp.className = 'power-up';
    const type = Math.random() < 0.5 ? 'shield' : 'slow-time';
    powerUp.classList.add(type);
    const topPosition = Math.random() * (gameContainer.offsetHeight - 25);
    powerUp.style.top = `${topPosition}px`;
    gameContainer.appendChild(powerUp);
    return powerUp;
}

function moveObstacles() {
    obstacles.forEach((obstacle, index) => {
        const currentLeft = parseFloat(obstacle.style.left || gameContainer.offsetWidth);
        obstacle.style.left = `${currentLeft - 5}px`;

        if (currentLeft < -30) {
            obstacle.remove();
            obstacles.splice(index, 1);
        }
    });
}

function movePowerUps() {
    powerUpItems.forEach((powerUp, index) => {
        const currentLeft = parseFloat(powerUp.style.left || gameContainer.offsetWidth);
        powerUp.style.left = `${currentLeft - 3}px`;

        if (currentLeft < -25) {
            powerUp.remove();
            powerUpItems.splice(index, 1);
        }
    });
} 
const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const powerUpElement = document.getElementById('power-up');
const gameOverElement = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const startButton = document.getElementById('start-btn');
const howToPlayBtn = document.getElementById('how-to-play-btn');
const howToPlay = document.getElementById('how-to-play');
const cooldownElement = document.getElementById('cooldown');

let score = 0;
let gameLoop;
let isGameOver = false;
let powerUpActive = false;
let powerUpType = 'None';
let powerUpTimer = 0;
let shootCooldown = 0;
const shootCooldownTime = 8;
let keys = {};

const player = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    width: 40,
    height: 40,
    speed: 5,
    color: '#00ffff'
};

let bullets = [];
let enemies = [];
let powerUps = [];

class Bullet {
    constructor(x, y, speed, color) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 10;
        this.speed = speed;
        this.color = color;
    }

    update() {
        this.y -= this.speed;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Enemy {
    constructor() {
        this.width = 30;
        this.height = 30;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -this.height;
        this.speed = 2 + Math.random() * 2;
        this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
    }

    update() {
        this.y += this.speed;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width/2, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.closePath();
        ctx.fill();
    }
}

class PowerUp {
    constructor() {
        this.width = 20;
        this.height = 20;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -this.height;
        this.speed = 1;
        this.type = Math.random() < 0.5 ? 'double' : 'shield';
        this.color = this.type === 'double' ? '#ffff00' : '#00ff00';
    }

    update() {
        this.y += this.speed;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.moveTo(player.x + player.width/2, player.y);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.closePath();
    ctx.fill();

    if (powerUpActive && powerUpType === 'shield') {
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(player.x + player.width/2, player.y + player.height/2, player.width * 0.8, 0, Math.PI * 2);
        ctx.stroke();
    }
}

function spawnEnemy() {
    if (Math.random() < 0.02) {
        enemies.push(new Enemy());
    }
}

function spawnPowerUp() {
    if (Math.random() < 0.005) {
        powerUps.push(new PowerUp());
    }
}

function updateGame() {
    // Update player position based on keyboard input
    if ((keys['ArrowLeft'] || keys['a'] || keys['A']) && player.x > 0) {
        player.x -= player.speed;
    }
    if ((keys['ArrowRight'] || keys['d'] || keys['D']) && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }

    bullets = bullets.filter(bullet => {
        bullet.update();
        return bullet.y > 0;
    });

    enemies = enemies.filter(enemy => {
        enemy.update();
        return enemy.y < canvas.height;
    });

    powerUps = powerUps.filter(powerUp => {
        powerUp.update();
        return powerUp.y < canvas.height;
    });

    checkCollisions();

    if (powerUpActive) {
        powerUpTimer--;
        if (powerUpTimer <= 0) {
            powerUpActive = false;
            powerUpType = 'None';
            powerUpElement.textContent = 'Power-up: None';
        }
    }

    if (shootCooldown > 0) {
        shootCooldown--;
        cooldownElement.textContent = `Cooldown: ${Math.ceil(shootCooldown / shootCooldownTime * 100)}%`;
    } else {
        cooldownElement.textContent = 'Cooldown: Ready';
    }

    spawnEnemy();
    spawnPowerUp();
}

function checkCollisions() {
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {
                bullets.splice(bulletIndex, 1);
                enemies.splice(enemyIndex, 1);
                score += 10;
                scoreElement.textContent = `Score: ${score}`;
            }
        });
    });

    enemies.forEach((enemy, index) => {
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            if (!powerUpActive || powerUpType !== 'shield') {
                gameOver();
            } else {
                enemies.splice(index, 1);
                powerUpActive = false;
                powerUpType = 'None';
                powerUpElement.textContent = 'Power-up: None';
            }
        }
    });

    powerUps.forEach((powerUp, index) => {
        if (player.x < powerUp.x + powerUp.width &&
            player.x + player.width > powerUp.x &&
            player.y < powerUp.y + powerUp.height &&
            player.y + player.height > powerUp.y) {
            powerUpActive = true;
            powerUpType = powerUp.type;
            powerUpTimer = 300;
            powerUpElement.textContent = `Power-up: ${powerUp.type}`;
            powerUps.splice(index, 1);
        }
    });
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw stars
    for (let i = 0; i < 50; i++) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            1, 1
        );
    }

    drawPlayer();
    bullets.forEach(bullet => bullet.draw());
    enemies.forEach(enemy => enemy.draw());
    powerUps.forEach(powerUp => powerUp.draw());
}

function gameOver() {
    isGameOver = true;
    clearInterval(gameLoop);
    finalScoreElement.textContent = score;
    gameOverElement.style.display = 'block';
}

function startGame() {
    player.x = canvas.width / 2 - player.width / 2;
    score = 0;
    bullets = [];
    enemies = [];
    powerUps = [];
    powerUpActive = false;
    powerUpType = 'None';
    powerUpTimer = 0;
    shootCooldown = 0;
    isGameOver = false;
    scoreElement.textContent = `Score: ${score}`;
    powerUpElement.textContent = 'Power-up: None';
    cooldownElement.textContent = 'Cooldown: Ready';
    gameOverElement.style.display = 'none';
    
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(() => {
        updateGame();
        drawGame();
    }, 1000/60);
}

document.addEventListener('keydown', (event) => {
    keys[event.key] = true;
    if (event.key === ' ' && !isGameOver && shootCooldown === 0) {
        if (powerUpActive && powerUpType === 'double') {
            bullets.push(new Bullet(player.x + 5, player.y, 7, '#00ffff'));
            bullets.push(new Bullet(player.x + player.width - 9, player.y, 7, '#00ffff'));
        } else {
            bullets.push(new Bullet(player.x + player.width/2 - 2, player.y, 7, '#00ffff'));
        }
        shootCooldown = shootCooldownTime;
    }
});

document.addEventListener('keyup', (event) => {
    keys[event.key] = false;
});

howToPlayBtn.addEventListener('click', () => {
    howToPlay.style.display = howToPlay.style.display === 'none' ? 'block' : 'none';
});

document.addEventListener('click', (event) => {
    if (!howToPlay.contains(event.target) && event.target !== howToPlayBtn) {
        howToPlay.style.display = 'none';
    }
});

startButton.addEventListener('click', startGame);
startGame();

// Add mouse move event listener
canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    if (mouseX > 0 && mouseX < canvas.width) {
        player.x = Math.max(0, Math.min(canvas.width - player.width, mouseX - player.width / 2));
    }
}); 
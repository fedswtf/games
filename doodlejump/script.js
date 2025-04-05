// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOver');

// Set canvas size
canvas.width = 400;
canvas.height = 600;

// Game variables
let score = 0;
let highScore = 0;
let isGameOver = true;
let animationFrameId = null;

// Player properties
const player = {
    width: 40,
    height: 40,
    x: canvas.width / 2 - 20,
    y: canvas.height - 100,
    dx: 0,
    dy: 0,
    speed: 3.5,
    jumpForce: -11.5,
    gravity: 0.2,
    color: getComputedStyle(document.documentElement).getPropertyValue('--player-color')
};

// Platform class
class Platform {
    constructor(x, y, type = 'normal', isStartPlatform = false) {
        this.width = isStartPlatform ? 120 : 70;
        this.height = 15;
        this.x = x;
        this.y = y;
        this.type = type;
        this.isStartPlatform = isStartPlatform;
        this.color = type === 'boost' ? 
            getComputedStyle(document.documentElement).getPropertyValue('--boost-platform-color') :
            getComputedStyle(document.documentElement).getPropertyValue('--platform-color');
        
        if(type === 'spring') {
            this.spring = {
                x: this.x + this.width/2 - 5,
                y: this.y - 10,
                width: 10,
                height: 10,
                color: getComputedStyle(document.documentElement).getPropertyValue('--spring-color')
            };
        }
        
        if(type === 'jetpack') {
            this.jetpack = {
                x: this.x + this.width/2 - 10,
                y: this.y - 20,
                width: 20,
                height: 20,
                color: getComputedStyle(document.documentElement).getPropertyValue('--jetpack-color')
            };
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        if(this.type === 'spring' && this.spring) {
            ctx.fillStyle = this.spring.color;
            ctx.fillRect(this.spring.x, this.spring.y, this.spring.width, this.spring.height);
        }
        
        if(this.type === 'jetpack' && this.jetpack) {
            ctx.fillStyle = this.jetpack.color;
            ctx.fillRect(this.jetpack.x, this.jetpack.y, this.jetpack.width, this.jetpack.height);
        }
    }
}

let platforms = [];
let cameraOffset = 0;
let jetpackActive = false;
let jetpackTimer = 0;

function createPlatform(y) {
    const x = Math.random() * (canvas.width - 70);
    const types = ['normal', 'normal', 'normal', 'normal', 'normal', 'spring', 'boost', 'jetpack'];
    const type = types[Math.floor(Math.random() * types.length)];
    return new Platform(x, y, type);
}

function initializePlatforms() {
    platforms = [];
    // Add starting platform in the middle
    const startPlatform = new Platform(
        canvas.width/2 - 60,
        canvas.height - 100,
        'normal',
        true
    );
    platforms.push(startPlatform);
    
    // Create rest of the platforms with more spacing
    for(let i = 1; i < 7; i++) {
        platforms.push(createPlatform(canvas.height - 100 - i * 120));
    }
}

function update() {
    if(isGameOver) return;

    // Update player position
    if(!jetpackActive) {
        player.dy += player.gravity;
    }
    player.x += player.dx;
    player.y += player.dy;

    // Wrap player around screen
    if(player.x + player.width < 0) player.x = canvas.width;
    if(player.x > canvas.width) player.x = -player.width;

    // Check for game over
    if(player.y > canvas.height) {
        gameOver();
        return;
    }

    // Update jetpack
    if(jetpackActive) {
        player.dy = -15;
        jetpackTimer--;
        if(jetpackTimer <= 0) {
            jetpackActive = false;
            player.dy = 0;
        }
    }

    // Platform collision
    platforms.forEach(platform => {
        if(player.dy > 0 && // Moving downward
           player.x < platform.x + platform.width &&
           player.x + player.width > platform.x &&
           player.y + player.height > platform.y &&
           player.y + player.height < platform.y + platform.height + player.dy + 1) { // Added +1 for more reliable collision
            
            player.y = platform.y - player.height; // Snap to platform
            if(platform.type === 'boost') {
                player.dy = player.jumpForce * 1.4;
            } else if(platform.type === 'spring' && platform.spring) {
                player.dy = player.jumpForce * 1.8;
            } else if(platform.type === 'jetpack' && platform.jetpack) {
                jetpackActive = true;
                jetpackTimer = 80;
            } else {
                player.dy = player.jumpForce;
            }
        }
    });

    // Camera and score
    if(player.y < canvas.height/2 && player.dy < 0) {
        cameraOffset -= player.dy;
        platforms.forEach(platform => platform.y -= player.dy);
        player.y -= player.dy;
        
        // Update score
        score = Math.floor(cameraOffset/100);
        document.getElementById('score').textContent = score;
    }

    // Remove platforms below screen and add new ones
    platforms = platforms.filter(platform => {
        if(platform.isStartPlatform && cameraOffset < 200) return true;
        return platform.y < canvas.height;
    });
    while(platforms.length < 7) {
        platforms.push(createPlatform(platforms[platforms.length-1].y - Math.random() * 100 - 50));
    }
}

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x + player.width/2, player.y + player.height/2, player.width/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw face
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(player.x + player.width/2 - 8, player.y + player.height/2 - 5, 4, 0, Math.PI * 2);
    ctx.arc(player.x + player.width/2 + 8, player.y + player.height/2 - 5, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw smile
    ctx.beginPath();
    ctx.arc(player.x + player.width/2, player.y + player.height/2 + 5, 8, 0, Math.PI);
    ctx.stroke();
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw clouds in background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    for(let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(100 + i * 150, 100 + Math.sin(Date.now()/1000 + i) * 20, 30, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw platforms
    platforms.forEach(platform => platform.draw());

    // Draw player
    drawPlayer();

    // Draw jetpack effect
    if(jetpackActive) {
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.moveTo(player.x + player.width/2, player.y + player.height);
        ctx.lineTo(player.x + player.width/2 - 10, player.y + player.height + 20);
        ctx.lineTo(player.x + player.width/2 + 10, player.y + player.height + 20);
        ctx.closePath();
        ctx.fill();
    }
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
    cameraOffset = 0;
    jetpackActive = false;
    jetpackTimer = 0;
    isGameOver = false;
    
    // Reset player
    player.x = canvas.width / 2 - 20;
    player.y = canvas.height - 130; // Start higher above the platform
    player.dx = 0;
    player.dy = 0;

    // Initialize platforms
    initializePlatforms();

    // Update UI
    document.getElementById('score').textContent = '0';
    document.getElementById('highScore').textContent = highScore;
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';

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
    
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalHighScore').textContent = highScore;
    gameOverScreen.style.display = 'block';
}

// Event listeners
document.addEventListener('keydown', function(event) {
    if (!isGameOver) {
        switch(event.key.toLowerCase()) {
            case 'arrowleft':
            case 'a':
                player.dx = -player.speed;
                break;
            case 'arrowright':
            case 'd':
                player.dx = player.speed;
                break;
        }
    }
});

document.addEventListener('keyup', function(event) {
    if (!isGameOver) {
        switch(event.key.toLowerCase()) {
            case 'arrowleft':
            case 'a':
            case 'arrowright':
            case 'd':
                player.dx = 0;
                break;
        }
    }
});

// Add click handlers for buttons
document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('restartButton').addEventListener('click', startGame);

// Initial draw
initializePlatforms();
draw(); 
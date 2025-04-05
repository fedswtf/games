const difficulty = {
    easy: { interval: 1500, duration: 1000 },
    medium: { interval: 1000, duration: 800 },
    hard: { interval: 750, duration: 600 }
};

let score = 0;
let timeLeft = 30;
let combo = 0;
let gameInterval;
let timeInterval;
let lastHit = 0;
let isPlaying = false;

const moles = document.querySelectorAll('.mole');
const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('time');
const comboDisplay = document.getElementById('combo');
const difficultySelect = document.getElementById('difficulty');
const startButton = document.getElementById('startButton');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreDisplay = document.getElementById('finalScore');
const playAgainButton = document.getElementById('playAgain');

function showMole() {
    const idx = Math.floor(Math.random() * moles.length);
    const mole = moles[idx];
    const isPowerUp = Math.random() < 0.1; // 10% chance for power-up

    if (isPowerUp) {
        mole.textContent = '⭐';
        mole.classList.add('power-up');
    } else {
        mole.textContent = '🦔';
        mole.classList.remove('power-up');
    }

    mole.classList.add('up');

    setTimeout(() => {
        mole.classList.remove('up');
        if (!mole.classList.contains('bonked')) {
            combo = 0;
            comboDisplay.textContent = combo;
        }
        mole.classList.remove('bonked');
    }, difficulty[difficultySelect.value].duration);
}

function startGame() {
    if (isPlaying) return;
    isPlaying = true;
    score = 0;
    timeLeft = 30;
    combo = 0;
    scoreDisplay.textContent = score;
    timeDisplay.textContent = timeLeft;
    comboDisplay.textContent = combo;
    gameOverScreen.style.display = 'none';

    gameInterval = setInterval(() => {
        if (Math.random() < 0.8) { // 80% chance to spawn a mole
            showMole();
        }
    }, difficulty[difficultySelect.value].interval);

    timeInterval = setInterval(() => {
        timeLeft--;
        timeDisplay.textContent = timeLeft;
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function endGame() {
    isPlaying = false;
    clearInterval(gameInterval);
    clearInterval(timeInterval);
    moles.forEach(mole => mole.classList.remove('up'));
    gameOverScreen.style.display = 'block';
    finalScoreDisplay.textContent = score;
}

function showComboText(x, y, points) {
    const comboText = document.createElement('div');
    comboText.className = 'combo-text';
    comboText.textContent = `+${points}!`;
    comboText.style.left = `${x}px`;
    comboText.style.top = `${y}px`;
    document.body.appendChild(comboText);
    setTimeout(() => comboText.remove(), 1000);
}

moles.forEach(mole => {
    mole.addEventListener('click', function(e) {
        if (!mole.classList.contains('up') || mole.classList.contains('bonked')) return;

        mole.classList.add('bonked');
        const isPowerUp = mole.classList.contains('power-up');
        
        const now = Date.now();
        if (now - lastHit < 500) { // If hit within 0.5 seconds
            combo++;
        } else {
            combo = 1;
        }
        lastHit = now;

        const points = isPowerUp ? 20 * combo : 10 * combo;
        score += points;
        
        showComboText(e.pageX, e.pageY, points);
        
        scoreDisplay.textContent = score;
        comboDisplay.textContent = combo;
        
        mole.parentElement.classList.add('shake');
        setTimeout(() => mole.parentElement.classList.remove('shake'), 200);
    });
});

startButton.addEventListener('click', startGame);
playAgainButton.addEventListener('click', startGame);
difficultySelect.addEventListener('change', () => {
    if (isPlaying) {
        clearInterval(gameInterval);
        gameInterval = setInterval(showMole, difficulty[difficultySelect.value].interval);
    }
}); 
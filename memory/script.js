const resetButton = document.getElementById('resetBtn');
const gameContainer = document.getElementById('gameContainer');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');

let flippedCards = [];
let matchedCards = [];
let gameStarted = false;
let gameTimer;
let elapsedTime = 0;
let attempts = 0;

const createGameBoard = () => {
    const values = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const deck = [...values, ...values];
    shuffle(deck);

    gameContainer.innerHTML = '';
    flippedCards = [];
    matchedCards = [];
    attempts = 0;
    scoreDisplay.innerText = `Attempts: ${attempts}`;
    elapsedTime = 0;
    timerDisplay.innerText = `Time: 0s`;
    gameStarted = false;

    deck.forEach((value, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.setAttribute('data-id', index);
        card.setAttribute('data-value', value);

        const cardInner = document.createElement('div');
        cardInner.classList.add('card-inner');

        const cardFront = document.createElement('div');
        cardFront.classList.add('card-front');

        const cardBack = document.createElement('div');
        cardBack.classList.add('card-back');
        cardBack.innerText = '?';

        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        card.appendChild(cardInner);

        card.addEventListener('click', flipCard);

        gameContainer.appendChild(card);
    });

    if (gameTimer) clearInterval(gameTimer);
};

const flipCard = (event) => {
    const clickedCard = event.target.closest('.card');

    if (!clickedCard || flippedCards.length >= 2 || clickedCard.classList.contains('flipped') || matchedCards.includes(clickedCard)) {
        return;
    }

    if (!gameStarted) {
        gameStarted = true;
        gameTimer = setInterval(updateTimer, 1000);
    }

    clickedCard.classList.add('flipped');
    const cardValue = clickedCard.dataset.value;
    clickedCard.querySelector('.card-back').innerText = cardValue;

    flippedCards.push(clickedCard);

    if (flippedCards.length === 2) {
        attempts++;
        scoreDisplay.innerText = `Attempts: ${attempts}`;
        checkForMatch();
    }
};

const checkForMatch = () => {
    const [firstCard, secondCard] = flippedCards;

    if (firstCard.dataset.value === secondCard.dataset.value) {
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        matchedCards.push(firstCard, secondCard);
        flippedCards = [];

        if (matchedCards.length === 16) {
            clearInterval(gameTimer);
            setTimeout(() => {
                alert(`You won! It took ${elapsedTime}s and ${attempts} attempts.`);
                createGameBoard();
            }, 500);
        }
    } else {
        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            flippedCards = [];
        }, 1000);
    }
};

const updateTimer = () => {
    elapsedTime++;
    timerDisplay.innerText = `Time: ${elapsedTime}s`;
};

const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
};

resetButton.addEventListener('click', createGameBoard);
createGameBoard(); 
// Game state
let cookies = 0;
let cookiesPerSecond = 0;
let cpsMultiplier = 1;
let cookiesPerClick = 1;

// Define all upgrades
const upgrades = {
    autoClicker: {
        count: 0,
        baseCost: 50,
        currentCost: 50,
        production: 1,
        name: 'Auto Clicker'
    },
    grandma: {
        count: 0,
        baseCost: 250,
        currentCost: 250,
        production: 5,
        name: 'Grandma'
    },
    factory: {
        count: 0,
        baseCost: 1000,
        currentCost: 1000,
        production: 20,
        name: 'Factory'
    },
    mine: {
        count: 0,
        baseCost: 5000,
        currentCost: 5000,
        production: 100,
        name: 'Mine'
    },
    temple: {
        count: 0,
        baseCost: 25000,
        currentCost: 25000,
        production: 500,
        name: 'Temple'
    },
    bank: {
        count: 0,
        baseCost: 125000,
        currentCost: 125000,
        production: 2500,
        name: 'Bank'
    },
    timeMachine: {
        count: 0,
        baseCost: 625000,
        currentCost: 625000,
        production: 12500,
        name: 'Time Machine'
    },
    portal: {
        count: 0,
        baseCost: 3125000,
        currentCost: 3125000,
        production: 62500,
        name: 'Portal'
    },
    antimatterCondenser: {
        count: 0,
        baseCost: 15625000,
        currentCost: 15625000,
        production: 312500,
        name: 'Antimatter Condenser'
    },
    prism: {
        count: 0,
        baseCost: 78125000,
        currentCost: 78125000,
        production: 1562500,
        name: 'Prism'
    }
};

// Define amplifiers
const amplifiers = {
    cpsMultiplier: {
        count: 0,
        baseCost: 1000,
        currentCost: 1000,
        multiplier: 0.05,
        name: 'CPS Multiplier'
    }
};

// DOM elements
const cookieElement = document.getElementById('cookie');
const cookieCountElement = document.getElementById('cookieCount');
const cookiesPerSecondElement = document.getElementById('cookiesPerSecond');
const cookiesPerClickElement = document.getElementById('cookiesPerClick');
const modal = document.getElementById('upgradesModal');
const resetModal = document.getElementById('resetModal');
const upgradesList = document.getElementById('upgradesList');
const fileInput = document.getElementById('fileInput');

// Game functions
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function updateDisplay() {
    // Update cookie count
    if (cookieCountElement) {
        cookieCountElement.textContent = formatNumber(Math.floor(cookies));
    }

    // Update CPS
    if (cookiesPerSecondElement) {
        cookiesPerSecondElement.textContent = formatNumber((cookiesPerSecond * cpsMultiplier).toFixed(1));
    }

    // Update CPC
    if (cookiesPerClickElement) {
        cookiesPerClickElement.textContent = formatNumber(cookiesPerClick.toFixed(1));
    }

    // Update upgrade buttons
    Object.entries(upgrades).forEach(([id, upgrade]) => {
        const button = document.querySelector(`#${id} button`);
        const costElement = document.getElementById(`${id}Cost`);
        
        if (button && costElement) {
            const canAfford = cookies >= upgrade.currentCost;
            button.disabled = !canAfford;
            costElement.textContent = formatNumber(upgrade.currentCost);
        }
    });

    // Update amplifier buttons
    Object.entries(amplifiers).forEach(([id, amplifier]) => {
        const button = document.querySelector(`#${id} button`);
        const costElement = document.getElementById(`${id}Cost`);
        const valueElement = document.getElementById(`${id}Value`);
        
        if (button && costElement) {
            const canAfford = cookies >= amplifier.currentCost;
            button.disabled = !canAfford;
            costElement.textContent = formatNumber(amplifier.currentCost);
        }
        
        if (valueElement) {
            valueElement.textContent = (1 + (amplifier.count * amplifier.multiplier)).toFixed(2);
        }
    });
}

function buyUpgrade(upgradeId) {
    const upgrade = upgrades[upgradeId];
    if (cookies >= upgrade.currentCost) {
        cookies -= upgrade.currentCost;
        upgrade.count++;
        cookiesPerSecond += upgrade.production;
        upgrade.currentCost = Math.floor(upgrade.currentCost * 1.15);
        updateDisplay();
    }
}

function buyAmplifier(amplifierId) {
    const amplifier = amplifiers[amplifierId];
    if (cookies >= amplifier.currentCost) {
        cookies -= amplifier.currentCost;
        amplifier.count++;
        cpsMultiplier = 1 + (amplifier.count * amplifier.multiplier);
        amplifier.currentCost = Math.floor(amplifier.currentCost * 1.15);
        updateDisplay();
    }
}

function updateUpgradesList() {
    if (!upgradesList) return;
    
    upgradesList.innerHTML = '';
    Object.entries(upgrades).forEach(([id, upgrade]) => {
        if (upgrade.count > 0) {
            const div = document.createElement('div');
            div.className = 'upgrade-count';
            div.innerHTML = `
                <span>${upgrade.name}</span>
                <span>Count: ${formatNumber(upgrade.count)}</span>
                <span>Production: ${formatNumber(upgrade.production * upgrade.count)} cookies/sec</span>
            `;
            upgradesList.appendChild(div);
        }
    });
}

// Modal functions
function showUpgrades() {
    if (modal) {
        modal.style.display = "block";
        updateUpgradesList();
    }
}

function closeModal() {
    if (modal) {
        modal.style.display = "none";
    }
}

// Notification system
function showNotification(message, isSuccess) {
    // Remove any existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification ${isSuccess ? 'success' : 'error'}`;
    
    // Add icon
    const icon = document.createElement('span');
    icon.className = `notification-icon ${isSuccess ? 'success-icon' : 'error-icon'}`;
    icon.innerHTML = isSuccess ? '✓' : '✕';
    
    // Add message
    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;
    
    // Assemble notification
    notification.appendChild(icon);
    notification.appendChild(messageSpan);
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Save to GitHub function
async function saveToAccount() {
    try {
        // Get user data from session storage
        const userData = JSON.parse(sessionStorage.getItem('userData'));
        if (!userData) {
            showNotification('Please log in to save your progress', false);
            return;
        }

        // Get current save file content from GitHub
        const response = await fetch('https://api.github.com/repos/denaswbs/games-folder-main/contents/CookieClicker/saves.json', {
            method: 'GET',
            headers: {
                'Authorization': `token ${SAVE_TOKEN}`  // Use the SAVE_TOKEN from repo secrets
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch save file');
        }

        const data = await response.json();
        const currentContent = data.content ? JSON.parse(atob(data.content)) : {};

        // Update user's save data
        currentContent[userData.username] = {
            cookies,
            cookiesPerSecond,
            cpsMultiplier,
            cookiesPerClick,
            upgrades,
            amplifiers,
            lastSaved: new Date().toISOString()
        };

        // Update file in GitHub
        const updateResponse = await fetch('https://api.github.com/repos/denaswbs/games-folder-main/contents/CookieClicker/saves.json', {
            method: 'PUT',
            headers: {
                'Authorization': `token ${SAVE_TOKEN}`,  // Use the SAVE_TOKEN from repo secrets
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Update save for ${userData.username}`,
                content: btoa(JSON.stringify(currentContent, null, 2)),
                sha: data.sha
            })
        });

        if (!updateResponse.ok) {
            throw new Error('Failed to update save file');
        }

        showNotification('Progress saved successfully!', true);
    } catch (error) {
        console.error('Error saving progress:', error);
        showNotification('Failed to save progress', false);
    }
}

// Load from GitHub function
async function loadFromAccount() {
    try {
        // Get user data from session storage
        const userData = JSON.parse(sessionStorage.getItem('userData'));
        if (!userData) {
            showNotification('Please log in to load your progress', false);
            return;
        }

        // Load from GitHub
        const response = await fetch('https://api.github.com/repos/denaswbs/games-folder-main/contents/CookieClicker/saves.json', {
            method: 'GET',
            headers: {
                'Authorization': `token ${SAVE_TOKEN}`  // Use the SAVE_TOKEN from repo secrets
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch save file');
        }

        const data = await response.json();
        const currentContent = JSON.parse(atob(data.content));
        const userSave = currentContent[userData.username];

        if (!userSave) {
            showNotification('No save file found', false);
            return;
        }

        // Apply the loaded data
        applyLoadedData(userSave);
        showNotification('Progress loaded successfully!', true);
    } catch (error) {
        console.error('Error loading progress:', error);
        showNotification('Failed to load progress', false);
    }
}

// Helper function to apply loaded data
function applyLoadedData(userSave) {
    // Update game state with loaded data
    cookies = userSave.cookies;
    cookiesPerSecond = userSave.cookiesPerSecond;
    cpsMultiplier = userSave.cpsMultiplier;
    cookiesPerClick = userSave.cookiesPerClick;
    
    // Update upgrades
    Object.entries(userSave.upgrades).forEach(([id, upgrade]) => {
        if (upgrades[id]) {
            upgrades[id].count = upgrade.count;
            upgrades[id].currentCost = upgrade.currentCost;
        }
    });
    
    // Update amplifiers
    Object.entries(userSave.amplifiers).forEach(([id, amplifier]) => {
        if (amplifiers[id]) {
            amplifiers[id].count = amplifier.count;
            amplifiers[id].currentCost = amplifier.currentCost;
        }
    });

    // Update display
    updateDisplay();
}

// Reset functions
let countdownInterval;
let countdownValue = 5;

function showResetModal() {
    if (resetModal) {
        resetModal.style.display = "block";
        countdownValue = 5;
        const countdownElement = document.querySelector('.countdown');
        const confirmButton = document.querySelector('.confirm-reset-btn');
        
        if (countdownElement) {
            countdownElement.textContent = countdownValue;
        }
        if (confirmButton) {
            confirmButton.disabled = true;
        }
        
        countdownInterval = setInterval(() => {
            countdownValue--;
            if (countdownElement) {
                countdownElement.textContent = countdownValue;
            }
            
            if (countdownValue <= 0) {
                clearInterval(countdownInterval);
                if (confirmButton) {
                    confirmButton.disabled = false;
                }
            }
        }, 1000);
    }
}

function resetProgress() {
    cookies = 0;
    cookiesPerSecond = 0;
    cpsMultiplier = 1;
    cookiesPerClick = 1;
    
    Object.entries(upgrades).forEach(([id, upgrade]) => {
        upgrade.count = 0;
        upgrade.currentCost = upgrade.baseCost;
    });
    
    Object.entries(amplifiers).forEach(([id, amplifier]) => {
        amplifier.count = 0;
        amplifier.currentCost = amplifier.baseCost;
    });
    
    updateDisplay();
    if (resetModal) {
        resetModal.style.display = "none";
    }
    clearInterval(countdownInterval);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Cookie click
    if (cookieElement) {
        cookieElement.addEventListener('click', () => {
            cookies += cookiesPerClick;
            updateDisplay();
        });
    }

    // Close modal buttons
    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });

    // Return button in reset modal
    const returnButton = document.querySelector('.return-btn');
    if (returnButton) {
        returnButton.addEventListener('click', () => {
            if (resetModal) {
                resetModal.style.display = "none";
            }
            clearInterval(countdownInterval);
        });
    }

    // Confirm reset button
    const confirmResetButton = document.querySelector('.confirm-reset-btn');
    if (confirmResetButton) {
        confirmResetButton.addEventListener('click', resetProgress);
    }

    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            closeModal();
        }
        if (event.target == resetModal) {
            resetModal.style.display = "none";
            clearInterval(countdownInterval);
        }
    });

    // Initial display update
    updateDisplay();
});

// Game loop
function gameLoop() {
    cookies += cookiesPerSecond * cpsMultiplier / 10;
    updateDisplay();
}

// Start the game loop
setInterval(gameLoop, 100);

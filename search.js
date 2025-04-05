// Detect keydown events and check for specific keys (letters, space, and shift key)
document.addEventListener('keydown', function(event) {
    const searchBar = document.getElementById('searchBar');
    
    // Ignore if any input element is focused
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
    }
    
    // Convert the event key to lowercase to handle both cases (lowercase and uppercase)
    const validKeys = [' ', 'Shift', ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(i + 65).toLowerCase())]; // A-Z (both lowercase and uppercase), and spacebar
    if (!validKeys.includes(event.key.toLowerCase())) {
        return; // Ignore other keys
    }

    if (searchBar !== document.activeElement) {
        searchBar.focus();  // Focus the search bar when typing
        searchBar.select(); // Select all the text in the search bar
    }
    
    searchGames(); // Trigger search when typing
});

// Handle the morphing effect when scrolling
let lastScrollTop = 0;
let ticking = false;
const scrollThreshold = 100; // Increased threshold for smoother transition

window.addEventListener('scroll', function() {
    if (!ticking) {
        window.requestAnimationFrame(function() {
            const topBar = document.getElementById('topBar');
            const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Calculate scroll progress (0 to 1) with easing
            const rawProgress = Math.min(currentScrollTop / scrollThreshold, 1);
            const scrollProgress = rawProgress * rawProgress * (3 - 2 * rawProgress); // Smooth easing function
            
            // Apply morphing effect based on scroll progress
            if (scrollProgress > 0) {
                topBar.classList.add('scrolled');
                topBar.style.setProperty('--scroll-progress', scrollProgress);
            } else {
                topBar.classList.remove('scrolled');
                topBar.style.setProperty('--scroll-progress', 0);
            }
            
            lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
            ticking = false;
        });
        ticking = true;
    }
});

// Initialize the top bar state when the page loads
document.addEventListener('DOMContentLoaded', function() {
    const topBar = document.getElementById('topBar');
    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (currentScrollTop > scrollThreshold) {
        topBar.classList.add('scrolled');
        topBar.style.setProperty('--scroll-progress', 1);
    }
});

// Function to handle the search process
function searchGames() {
    const searchQuery = document.getElementById('searchBar').value.toLowerCase();
    const gameContainers = document.querySelectorAll('.menuContainer'); // Select all game containers

    let foundGame = false; // Track if any game matches the search query

    gameContainers.forEach(container => {
        const gameTitle = container.querySelector('h1').textContent.toLowerCase();

        // Check if the search query matches the game title
        if (gameTitle.includes(searchQuery)) {
            container.style.display = 'block';
            foundGame = true;
        } else {
            container.style.display = 'none';
        }
    });

    // If any game matches, scroll to the first visible game container
    if (foundGame) {
        const firstVisibleGame = document.querySelector('.menuContainer:not([style*="display: none"])');
        if (firstVisibleGame) {
            firstVisibleGame.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

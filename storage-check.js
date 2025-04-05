// Function to check if storage is available
function checkStorage() {
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        sessionStorage.setItem('test', 'test');
        sessionStorage.removeItem('test');
        console.log('Storage check passed');
        return true;
    } catch (e) {
        console.log('Storage check failed:', e);
        return false;
    }
}

// Function to create warning element
function createWarningElement() {
    console.log('Creating warning element');
    const warning = document.createElement('div');
    warning.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: white;
        padding: 2rem;
        border-radius: 10px;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
        text-align: center;
        width: 80%;
        max-width: 500px;
        z-index: 1000;
    `;

    const title = document.createElement('h1');
    title.textContent = 'sessionStorage/localStorage has been disabled';
    title.style.marginBottom = '1rem';
    title.style.color = '#333';

    const message = document.createElement('p');
    message.textContent = 'Please enable these settings to play';
    message.style.color = '#666';

    warning.appendChild(title);
    warning.appendChild(message);

    return warning;
}

// Function to add breathing animation to body
function addBreathingAnimation() {
    console.log('Adding breathing animation');
    const style = document.createElement('style');
    style.textContent = `
        body {
            animation: breathing 3s ease-in-out infinite;
        }
        @keyframes breathing {
            0% {
                background-color: white;
            }
            50% {
                background-color: #ffebee;
            }
            100% {
                background-color: white;
            }
        }
    `;
    document.head.appendChild(style);
}

// Check storage when page loads
console.log('Storage check script loaded');
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    if (!checkStorage()) {
        console.log('Storage is disabled, showing warning');
        // Add breathing animation to body
        addBreathingAnimation();
        // Add warning message
        document.body.appendChild(createWarningElement());
    }
}); 
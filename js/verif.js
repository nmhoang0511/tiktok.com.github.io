// js/verif.js

// --- Popup Utility Function ---

/**
 * Displays a notification popup (success or error).
 * @param {string} type - 'left' (error) or 'right' (success).
 * @param {string} message - The notification message content.
 */
function showPopup(type, message) {
    const popupId = `popup-${type}`;
    const popup = document.getElementById(popupId);
    const popupText = popup.querySelector('.popup-text');
    const loadingSpinner = popup.querySelector('.loading-spinner');

    if (!popup) return;

    // Reset visibility and content
    popup.classList.remove('loading');
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    
    if (popupText) {
        popupText.textContent = message;
        popupText.style.display = 'block';
    }

    // Display popup
    popup.style.display = 'block';

    // Auto-hide after 3 seconds
    setTimeout(() => {
        popup.style.display = 'none';
    }, 3000);
}

// --- Verification Logic ---

/**
 * Handles the username verification process when the "Verify" button is clicked.
 */
async function handleUserVerification() {
    const inputElement = document.querySelector('.input2');
    const username = inputElement.value.trim();
    const popupLeft = document.getElementById('popup-left');
    const accountNameElement = document.getElementById('account-name');

    // 1. Input Check
    if (!username) {
        showPopup('left', 'Please enter a username.');
        return;
    }

    // 2. Display Loading State (using the left popup as a generic loader)
    if (popupLeft) {
        popupLeft.style.display = 'block';
        popupLeft.classList.add('loading');
        
        const loadingSpinner = popupLeft.querySelector('.loading-spinner');
        const popupText = popupLeft.querySelector('.popup-text');

        if (loadingSpinner) loadingSpinner.style.display = 'block';
        if (popupText) popupText.style.display = 'none';
    }


    // 3. Simulate Verification Process (e.g., waiting for an API response)
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    // 4. Determine Simulated Result
    let isValidUser = true;
    let simulatedUsername = ''; 

    // Verification Rules (You can adjust these)
    if (username.toLowerCase() === 'erroruser' || username.length < 3 || username.includes(' ')) {
        isValidUser = false;
    } else {
        simulatedUsername = `@${username.replace(/[^a-zA-Z0-9_]/g, '')}`; 
    }

    // 5. Update UI based on Result
    
    // Hide the loading state immediately
    if (popupLeft) {
        popupLeft.style.display = 'none';
        popupLeft.classList.remove('loading');
    }

    if (isValidUser) {
        // Success: Show success popup and update account name
        showPopup('right', `Account ${simulatedUsername} verified successfully!`);
        
        if (accountNameElement) {
            accountNameElement.textContent = simulatedUsername;
        }

    } else {
        // Failure: Show error popup and reset account name
        showPopup('left', 'Invalid or non-existent username.');
        if (accountNameElement) {
            accountNameElement.textContent = 'Not Verified';
        }
    }
}


// --- Initialization ---

document.addEventListener("DOMContentLoaded", function() {
    const button = document.querySelector(".buttonwaw");
    const popupLeft = document.getElementById("popup-left");
    const popupRight = document.getElementById("popup-right");

    // 1. Attach event listener to the "Verify" button
    if (button) {
        button.addEventListener("click", handleUserVerification);
    }
    
    // 2. Global listener to hide popups on external click
    document.addEventListener("click", function(event) {
        // Only hide if the click target is NOT the popups themselves, the button, or the input field
        if (
            event.target !== popupLeft &&
            !popupLeft.contains(event.target) &&
            event.target !== popupRight &&
            !popupRight.contains(event.target) &&
            event.target !== button
        ) {
             // Only hide if they are visible
            if (popupLeft && popupLeft.style.display === "block") {
                 popupLeft.style.display = "none";
            }
            if (popupRight && popupRight.style.display === "block") {
                 popupRight.style.display = "none";
            }
        }
    });
});

// REMOVED:
// - The function simulatePayment(), which belongs in js/paiement.js.
// - The payment button event listener (payButton.addEventListener), which belongs in js/paiement.js.
// - The arbitrary click position check (clickX < buttonWidth / 2).

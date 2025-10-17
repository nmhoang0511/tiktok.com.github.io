// js/montantPerso.js

// --- Global Constants and Utilities ---

const COST_PER_COIN = 0.0118; // Approx. rate: 1 Coin = 0.0118 EUR (Used for custom calculation)
const MIN_CUSTOM_COINS = 70;
const MAX_CUSTOM_COINS = 2500000;

let currentSelectedButton = null;
let isCustomInputActive = false;
let currentCustomCoinAmount = 0; // Store the validated custom coin amount

/**
 * Utility to format a number as a price string (e.g., 123.45 -> 123,45).
 * @param {number} price - The price number.
 * @returns {string} Formatted price string.
 */
function formatPrice(price) {
    // Round to 2 decimal places and replace dot with comma for Euro format
    return price.toFixed(2).replace('.', ',');
}

/**
 * Utility to remove commas from a number string.
 * @param {string} numberString - The input value string.
 * @returns {string} String with all commas removed.
 */
function removeCommas(numberString) {
    return numberString.replace(/,/g, '');
}

/**
 * Utility to format a number with commas as thousands separators (e.g., 1234567 -> 1,234,567).
 * @param {number} number - The integer value.
 * @returns {string} Formatted number string.
 */
function formatNumberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// --- Main Logic Functions ---

/**
 * Updates the total price display and highlights the selected button.
 * @param {number} price - The Euro price to display.
 * @param {number} coinQuantity - The number of coins.
 * @param {HTMLElement} selectedButton - The button element that was clicked (optional).
 */
function updateTotalPrice(price, coinQuantity, selectedButton = null) {
    const totalAmountElement = document.getElementById('total-amount');
    
    // 1. Clear highlight from previous button
    if (currentSelectedButton) {
        currentSelectedButton.classList.remove('valide');
        currentSelectedButton.classList.remove('invalid');
    }

    // 2. Set new highlighted button
    if (selectedButton) {
        currentSelectedButton = selectedButton;
        currentSelectedButton.classList.add('valide');
    } else {
        currentSelectedButton = null;
    }

    // 3. Update price display
    const formattedPrice = formatPrice(price);
    totalAmountElement.textContent = formattedPrice;
    
    // 4. Update order summary (if necessary)
    updateOrderSummary(coinQuantity, price);
}

/**
 * Updates the Coin quantity display in the payment popup summary.
 * @param {number} quantity - The number of coins.
 */
function updateOrderSummary(quantity, price) {
    const coinQuantityElement = document.getElementById('coin-quantity');
    const coinPriceElement = document.getElementById('coin-price');
    const coinPrice2Element = document.getElementById('coin-price2');
    
    if (coinQuantityElement && coinPriceElement && coinPrice2Element) {
        // Format the coin quantity with commas
        const formattedQuantity = quantity.toLocaleString('en-US');
        
        coinQuantityElement.textContent = `${formattedQuantity} Coins`;
        coinPriceElement.textContent = `€ ${formatPrice(price)}`;
        coinPrice2Element.textContent = `€ ${formatPrice(price)}`;
    }
}

/**
 * Toggles the "Custom" button between static text and input field.
 */
function toggleCustomInput() {
    const customCase = document.getElementById('custom-case');
    const customText = document.getElementById('custom-text');
    const customDescription = document.getElementById('custom-description');
    
    // If an input is already active, we must handle the transition
    const existingInput = document.getElementById('custom-coin-input');

    if (isCustomInputActive) {
        // --- 2. DEACTIVATE (Go back to default state) ---
        
        // Remove 'valide' class from custom button when closing
        if(currentSelectedButton === customCase) {
             customCase.classList.remove('valide');
        }
        
        // Restore original content
        customText.innerHTML = 'Custom';
        customDescription.innerHTML = 'Higher amounts supported';
        
        // Reset state
        isCustomInputActive = false;
        
        // Reset the total price and selection if the custom button was the one selected
        if (currentSelectedButton === customCase) {
            updateTotalPrice(0, 0, null);
        }
        
    } else {
        // --- 1. ACTIVATE (Show input) ---
        
        // Deselect any other button that might be active
        if (currentSelectedButton && currentSelectedButton !== customCase) {
            currentSelectedButton.classList.remove('valide');
            currentSelectedButton = null;
        }

        // Create and configure input
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'montant';
        input.placeholder = `${MIN_CUSTOM_COINS} - ${MAX_CUSTOM_COINS.toLocaleString('en-US')}`;
        input.id = 'custom-coin-input';

        // Clear content and append input
        customText.innerHTML = '';
        customText.appendChild(input);
        customDescription.textContent = `${MIN_CUSTOM_COINS} - ${MAX_CUSTOM_COINS.toLocaleString('en-US')}`;
        
        // Set state and focus
        isCustomInputActive = true;
        customCase.classList.add('valide');
        currentSelectedButton = customCase;
        
        // Populate input with previously validated value (if any)
        if (currentCustomCoinAmount > 0) {
            input.value = formatNumberWithCommas(currentCustomCoinAmount);
            // Also trigger price update for the initial state
            handleCustomAmountUpdate(currentCustomCoinAmount);
        } else {
            // If no previous value, ensure total is 0.00
            updateTotalPrice(0, 0, customCase); 
        }

        input.focus();
        
        // --- Input Event Listeners ---
        
        input.addEventListener('input', function () {
            const rawValue = removeCommas(input.value);
            const coins = parseInt(rawValue);
            const isValidNumber = /^\d+$/.test(rawValue);

            if (!isValidNumber && rawValue !== '') {
                // Keep only numbers and commas by restoring previous valid state
                const currentCursor = input.selectionStart - 1;
                input.value = formatNumberWithCommas(parseInt(rawValue.replace(/\D/g, '')));
                input.setSelectionRange(currentCursor, currentCursor);
                return;
            }
            
            // Format number with commas on display
            if (rawValue !== '') {
                input.value = formatNumberWithCommas(coins);
            }
            
            handleCustomAmountUpdate(coins, input, customCase, customDescription);
        });
        
        input.addEventListener('keypress', function (event) {
            // Allow only digits (0-9)
            const key = event.key;
            if (/\D/.test(key) && key !== 'Backspace' && key !== 'Delete' && key !== 'ArrowLeft' && key !== 'ArrowRight') {
                event.preventDefault(); 
            }
        });
        
        // Re-calculate on blur to ensure final validation
        input.addEventListener('blur', function () {
            const rawValue = removeCommas(input.value);
            const coins = parseInt(rawValue);
            handleCustomAmountUpdate(coins, input, customCase, customDescription);
        });
    }
}

/**
 * Handles validation and price calculation for the custom coin input.
 * @param {number} coins - The integer coin value.
 * @param {HTMLElement} [input] - The custom input element.
 * @param {HTMLElement} [customCase] - The custom button element.
 * @param {HTMLElement} [customDescription] - The description element.
 */
function handleCustomAmountUpdate(coins, input = null, customCase = null, customDescription = null) {
    
    // Use fallback elements if not provided (when called from other functions)
    if (!customCase) customCase = document.getElementById('custom-case');
    if (!customDescription) customDescription = document.getElementById('custom-description');
    
    let totalAmount = 0;
    let isValid = false;
    let message = '';
    
    if (isNaN(coins) || coins < MIN_CUSTOM_COINS) {
        message = `<span style="color: red;">&#10005; Minimum: ${MIN_CUSTOM_COINS}</span>`;
        // Clear value if below min
        if (coins > 0) coins = 0; 
    } else if (coins > MAX_CUSTOM_COINS) {
        message = `<span style="color: red;">&#10005; Maximum: ${MAX_CUSTOM_COINS.toLocaleString('en-US')}</span>`;
    } else {
        // Valid amount
        totalAmount = coins * COST_PER_COIN;
        message = '€ ' + formatPrice(totalAmount);
        isValid = true;
    }

    // Update global state and UI classes
    if (isValid) {
        customCase.classList.remove('invalid');
        customCase.classList.add('valide');
        currentCustomCoinAmount = coins;
    } else {
        customCase.classList.add('invalid');
        customCase.classList.remove('valide');
        currentCustomCoinAmount = 0;
    }

    // Update description message and total price
    customDescription.innerHTML = message;
    updateTotalPrice(totalAmount, currentCustomCoinAmount, customCase);
}

// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Set initial total price
    const totalAmountElement = document.getElementById('total-amount');
    if (totalAmountElement) {
        totalAmountElement.textContent = '0,00';
    }
    
    // 2. Attach event listeners to all fixed-amount grid items
    const gridItems = document.querySelectorAll('.grid-item:not(#custom-case)');
    gridItems.forEach(item => {
        // Extract price and coin quantity from the HTML elements
        const priceText = item.querySelector('.coin-number-euro').textContent;
        const price = parseFloat(priceText.replace('€ ', '').replace(',', '.'));
        const quantity = parseInt(item.querySelector('.coin-number').getAttribute('value'));
        
        item.onclick = () => {
            // Check if the custom input is active and close it if so
            if (isCustomInputActive) {
                toggleCustomInput();
            }
            updateTotalPrice(price, quantity, item);
        };
    });
    
    // 3. Attach event listener to the custom button
    document.getElementById('custom-case').onclick = toggleCustomInput;
});

// Remove unused functions from the original script
// function showInput() {}
// function createButton(text) {}
// function customPurchase() {}

// End of js/montantPerso.js

/* =========================================================
   main.js - Sollie's Bakery (Part 3)
   Shared interactive features, loaded on every page:
     1. Mobile navigation menu toggle
     2. FAQ accordion (only does something on pages that have one)
   ========================================================= */

// Wait until the whole page has loaded before running our code
document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupAccordion();
});

/* ---------------------------------------------------------
   1. MOBILE MENU
   Adds a "Menu" button above the navigation links.
   On small screens, CSS hides the links until the button is clicked.
   --------------------------------------------------------- */
function setupMobileMenu() {
    var nav = document.querySelector('nav');
    var menuList = nav ? nav.querySelector('ul') : null;

    // If this page has no navigation, stop here
    if (!nav || !menuList) {
        return;
    }

    // Give the list an id so the button can point to it (helps screen readers)
    menuList.id = 'main-menu';

    // Create the button
    var toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'nav-toggle';
    toggleButton.textContent = 'Menu';
    toggleButton.setAttribute('aria-expanded', 'false');
    toggleButton.setAttribute('aria-controls', 'main-menu');

    // Put the button inside the nav, before the list of links
    nav.insertBefore(toggleButton, menuList);

    // This class tells the CSS that the menu can be collapsed
    nav.classList.add('nav-collapsible');

    // When the button is clicked, open or close the menu
    toggleButton.addEventListener('click', function () {
        var isOpen = nav.classList.toggle('open');
        toggleButton.setAttribute('aria-expanded', isOpen);
        toggleButton.textContent = isOpen ? 'Close' : 'Menu';
    });
}

/* ---------------------------------------------------------
   2. FAQ ACCORDION
   Each question is a button. Clicking it shows that answer
   and hides all the others.
   --------------------------------------------------------- */
function setupAccordion() {
    var buttons = document.querySelectorAll('.accordion-button');

    buttons.forEach(function (button) {
        var panel = document.getElementById(button.getAttribute('aria-controls'));

        // Start with every answer hidden
        if (panel) {
            panel.hidden = true;
        }

        button.addEventListener('click', function () {
            var wasOpen = button.getAttribute('aria-expanded') === 'true';

            // First close every question
            buttons.forEach(function (otherButton) {
                var otherPanel = document.getElementById(otherButton.getAttribute('aria-controls'));
                otherButton.setAttribute('aria-expanded', 'false');
                if (otherPanel) {
                    otherPanel.hidden = true;
                }
            });

            // Then open the clicked one (unless it was already open)
            if (!wasOpen && panel) {
                button.setAttribute('aria-expanded', 'true');
                panel.hidden = false;
            }
        });
    });
}
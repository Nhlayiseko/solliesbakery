/* =========================================================
   search.js - Sollie's Bakery (Part 3)
   Menu search and category filter for products.html.
     - Typing in the search box filters products as you type
     - The category buttons show All / Bread / Pastries / Cakes
     - A status line shows how many products are visible
   Only runs on pages that have #menu-search (the Products page).
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

    var searchInput = document.getElementById('menu-search');
    if (!searchInput) {
        return; // not the products page, so do nothing
    }

    var clearButton = document.getElementById('menu-clear');
    var statusMessage = document.getElementById('search-status');
    var filterButtons = document.querySelectorAll('.filter-button');

    // The three menu categories and every product on the page
    var categories = document.querySelectorAll('#bread, #pastries, #cakes');
    var products = document.querySelectorAll('.product');

    // Which category button is active ('all', 'bread', 'pastries' or 'cakes')
    var activeCategory = 'all';

    /* Work out which products to show, then show or hide them */
    function applyFilters() {
        // Turn the typed text into a list of lowercase words
        var searchText = searchInput.value.trim().toLowerCase();
        var searchWords = searchText === '' ? [] : searchText.split(/\s+/);

        var visibleCount = 0;

        products.forEach(function (product) {
            var listItem = product.closest('li');
            var category = product.closest('section');

            // Only the text a visitor can actually see (name, description, price)
            var productText = product.textContent.toLowerCase();

            // A product matches if it contains EVERY word that was typed
            var matchesSearch = searchWords.every(function (word) {
                return productText.includes(word);
            });

            // ...and it is in the chosen category (or "All" is chosen)
            var matchesCategory = (activeCategory === 'all' || category.id === activeCategory);

            var shouldShow = matchesSearch && matchesCategory;
            listItem.hidden = !shouldShow;

            if (shouldShow) {
                visibleCount++;
            }
        });

        // Hide a whole category heading if none of its products are showing
        categories.forEach(function (category) {
            var visibleInCategory = category.querySelectorAll('li:not([hidden])').length;
            category.hidden = (visibleInCategory === 0);
        });

        updateStatus(visibleCount, products.length, searchInput.value.trim());
    }

    /* Write the message under the search box */
    function updateStatus(visible, total, searchText) {
        if (visible === 0) {
            statusMessage.textContent = 'Sorry, nothing on our menu matches your search';
            if (searchText !== '') {
                statusMessage.textContent += ' for "' + searchText + '"';
            }
            statusMessage.textContent += '. Try a different word, or clear the search to see everything.';
            statusMessage.classList.add('no-results');
        } else {
            statusMessage.textContent = 'Showing ' + visible + ' of ' + total + ' menu items.';
            statusMessage.classList.remove('no-results');
        }
    }

    /* Mark one category button as the active one */
    function setActiveButton(chosenButton) {
        filterButtons.forEach(function (button) {
            var isChosen = (button === chosenButton);
            button.classList.toggle('active', isChosen);
            button.setAttribute('aria-pressed', isChosen);
        });
    }

    // Filter every time a letter is typed or deleted
    searchInput.addEventListener('input', applyFilters);

    // Filter when a category button is clicked
    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            activeCategory = button.getAttribute('data-category');
            setActiveButton(button);
            applyFilters();
        });
    });

    // The clear button resets the search box and goes back to "All"
    clearButton.addEventListener('click', function () {
        searchInput.value = '';
        activeCategory = 'all';
        setActiveButton(document.querySelector('.filter-button[data-category="all"]'));
        applyFilters();
        searchInput.focus();
    });

    // Show the starting message ("Showing 9 of 9 menu items.")
    applyFilters();
});
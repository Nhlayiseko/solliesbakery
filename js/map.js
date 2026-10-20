/* =========================================================
   map.js - Sollie's Bakery (Part 3)
   Interactive map on contact.html.
   One Google Map is shown at a time. Two buttons switch the
   map between the Main Storefront and the Weekend Market Stall.
   Only runs on pages that have #map-frame (the Contact page).
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

    var mapFrame = document.getElementById('map-frame');
    if (!mapFrame) {
        return; // not the contact page, so do nothing
    }

    var mapButtons = document.querySelectorAll('.map-button');
    var mapCaption = document.getElementById('map-caption');

    mapButtons.forEach(function (button) {
        button.addEventListener('click', function () {

            // Swap the map to the location stored on the clicked button
            mapFrame.src = button.getAttribute('data-map');
            mapFrame.title = 'Map showing ' + button.getAttribute('data-name');

            // Update the caption under the map
            mapCaption.textContent = 'Showing: ' + button.getAttribute('data-name');

            // Mark the clicked button as the active one
            mapButtons.forEach(function (otherButton) {
                var isChosen = (otherButton === button);
                otherButton.classList.toggle('active', isChosen);
                otherButton.setAttribute('aria-pressed', isChosen);
            });
        });
    });
});
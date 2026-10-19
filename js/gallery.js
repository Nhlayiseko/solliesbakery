/* =========================================================
   gallery.js - Sollie's Bakery (Part 3)
   Gallery lightbox: click a photo to see it enlarged.
   Features: close button, Esc key, click outside to close,
   previous / next buttons and left / right arrow keys.
   Only runs on gallery.html (the only page with #lightbox).
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

    // Find the lightbox parts on the page
    var lightbox = document.getElementById('lightbox');
    if (!lightbox) {
        return; // not the gallery page, so do nothing
    }

    var lightboxImage = document.getElementById('lightbox-image');
    var lightboxCaption = document.getElementById('lightbox-caption');
    var closeButton = document.getElementById('lightbox-close');
    var prevButton = document.getElementById('lightbox-prev');
    var nextButton = document.getElementById('lightbox-next');

    // All the gallery photos, in the order they appear on the page
    var photos = document.querySelectorAll('#gallery figure img');

    // Which photo is currently showing (a number starting at 0)
    var currentIndex = 0;

    // Remember which photo opened the lightbox, so focus can return to it
    var lastFocusedPhoto = null;

    /* Show the photo at a given position in the list */
    function showPhoto(index) {
        // Wrap around: after the last photo comes the first, and vice versa
        if (index < 0) {
            index = photos.length - 1;
        }
        if (index >= photos.length) {
            index = 0;
        }
        currentIndex = index;

        var photo = photos[currentIndex];
        var caption = photo.parentElement.querySelector('figcaption');

        lightboxImage.src = photo.src;
        lightboxImage.alt = photo.alt;
        lightboxCaption.textContent = caption ? caption.textContent : photo.alt;
    }

    /* Open the lightbox on a chosen photo */
    function openLightbox(index) {
        lastFocusedPhoto = photos[index];
        showPhoto(index);
        lightbox.hidden = false;
        document.body.classList.add('lightbox-open'); // stops the page scrolling behind it
        closeButton.focus();
    }

    /* Close the lightbox */
    function closeLightbox() {
        lightbox.hidden = true;
        document.body.classList.remove('lightbox-open');
        if (lastFocusedPhoto) {
            lastFocusedPhoto.focus(); // give focus back to the photo that was clicked
        }
    }

    /* Make every photo clickable (and usable with the keyboard) */
    photos.forEach(function (photo, index) {
        photo.setAttribute('tabindex', '0');
        photo.setAttribute('role', 'button');

        photo.addEventListener('click', function () {
            openLightbox(index);
        });

        photo.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openLightbox(index);
            }
        });
    });

    /* Buttons */
    closeButton.addEventListener('click', closeLightbox);
    prevButton.addEventListener('click', function () {
        showPhoto(currentIndex - 1);
    });
    nextButton.addEventListener('click', function () {
        showPhoto(currentIndex + 1);
    });

    /* Clicking the dark background (but not the photo or buttons) closes it */
    lightbox.addEventListener('click', function (event) {
        if (event.target === lightbox) {
            closeLightbox();
        }
    });

    /* Keyboard: Esc closes, arrow keys move between photos */
    document.addEventListener('keydown', function (event) {
        if (lightbox.hidden) {
            return; // only react while the lightbox is open
        }
        if (event.key === 'Escape') {
            closeLightbox();
        } else if (event.key === 'ArrowLeft') {
            showPhoto(currentIndex - 1);
        } else if (event.key === 'ArrowRight') {
            showPhoto(currentIndex + 1);
        }
    });
});
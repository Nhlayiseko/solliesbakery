/* =========================================================
   enquiry.js - Sollie's Bakery (Part 3)
   Custom order enquiry form on enquiry.html:
     1. Client-side validation with clear error messages
     2. AJAX submission with fetch() (no page reload)
     3. Success / failure feedback for the visitor
   Only runs on pages that have #enquiry-form-element.
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

    var form = document.getElementById('enquiry-form-element');
    if (!form) {
        return; // not the enquiry page, so do nothing
    }

    var statusBox = document.getElementById('form-status');
    var submitButton = form.querySelector('button[type="submit"]');
    var dateInput = document.getElementById('event-date');

    /* ---------------------------------------------------------
       DATE HELPERS
       Custom orders need at least 5 working days' notice
       (Monday to Friday), as stated on the page.
       --------------------------------------------------------- */
    function addWorkingDays(startDate, days) {
        var result = new Date(startDate);
        var added = 0;
        while (added < days) {
            result.setDate(result.getDate() + 1);
            var dayOfWeek = result.getDay(); // 0 = Sunday, 6 = Saturday
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                added++;
            }
        }
        return result;
    }

    // Turns a date into the "yyyy-mm-dd" text a date input uses
    function toInputDate(date) {
        var year = date.getFullYear();
        var month = String(date.getMonth() + 1).padStart(2, '0');
        var day = String(date.getDate()).padStart(2, '0');
        return year + '-' + month + '-' + day;
    }

    var earliestDate = addWorkingDays(new Date(), 5);
    var earliestText = toInputDate(earliestDate);
    var earliestReadable = earliestDate.toLocaleDateString('en-ZA', {
        day: 'numeric', month: 'long', year: 'numeric'
    });

    // Stop the date picker offering dates that are too soon
    dateInput.min = earliestText;

    /* ---------------------------------------------------------
       VALIDATION RULES
       Each rule gets the field's text and returns an error
       message, or an empty string if the value is fine.
       --------------------------------------------------------- */
    var rules = {

        'full-name': function (value) {
            if (value === '') {
                return 'Please enter your full name.';
            }
            if (value.length < 2) {
                return 'Your name must be at least 2 characters long.';
            }
            if (!/^[A-Za-zÀ-ÿ' -]+$/.test(value)) {
                return 'Your name can only contain letters, spaces, hyphens and apostrophes.';
            }
            return '';
        },

        'email': function (value) {
            if (value === '') {
                return 'Please enter your email address.';
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                return 'Please enter a valid email address, for example name@example.com.';
            }
            return '';
        },

        // Phone is optional, but if it is filled in it must look right
        'phone': function (value) {
            if (value === '') {
                return '';
            }
            var digitsOnly = value.replace(/[\s-]/g, '');
            if (!/^(0\d{9}|\+27\d{9})$/.test(digitsOnly)) {
                return 'Please enter a valid South African number, e.g. 082 123 4567 or +27 82 123 4567.';
            }
            return '';
        },

        'order-type': function (value) {
            if (value === '') {
                return 'Please choose an order type.';
            }
            return '';
        },

        'event-date': function (value) {
            if (value === '') {
                return 'Please choose the date you need your order.';
            }
            if (value < earliestText) {
                return 'Custom orders need at least 5 working days\' notice. Please choose ' +
                       earliestReadable + ' or later.';
            }
            return '';
        },

        'servings': function (value) {
            if (value === '') {
                return 'Please enter the approximate number of servings.';
            }
            var number = Number(value);
            if (!Number.isInteger(number) || number < 1) {
                return 'Please enter a whole number of servings, 1 or more.';
            }
            if (number > 500) {
                return 'For more than 500 servings, enter 500 and describe your event in "Tell Us More".';
            }
            return '';
        },

        // Optional, but not too long
        'details': function (value) {
            if (value.length > 1000) {
                return 'Please keep your message under 1000 characters (it is ' + value.length + ' now).';
            }
            return '';
        }
    };

    /* ---------------------------------------------------------
       SHOWING AND CLEARING ERROR MESSAGES
       --------------------------------------------------------- */
    function showError(field, message) {
        var errorId = field.id + '-error';
        var errorBox = document.getElementById(errorId);

        // Create the error box the first time it is needed
        if (!errorBox) {
            errorBox = document.createElement('span');
            errorBox.id = errorId;
            errorBox.className = 'error-message';
            field.parentElement.appendChild(errorBox);
        }

        errorBox.textContent = message;
        field.setAttribute('aria-invalid', 'true');
        field.setAttribute('aria-describedby', errorId);
    }

    function clearError(field) {
        var errorBox = document.getElementById(field.id + '-error');
        if (errorBox) {
            errorBox.textContent = '';
        }
        field.removeAttribute('aria-invalid');
        field.removeAttribute('aria-describedby');
    }

    // Check one field. Returns true if it is fine, false if not.
    function validateField(field) {
        var message = rules[field.id](field.value.trim());
        if (message !== '') {
            showError(field, message);
            return false;
        }
        clearError(field);
        return true;
    }

    // Check every field. Returns true only if all are fine.
    function validateAll() {
        var allGood = true;
        var firstBad = null;

        Object.keys(rules).forEach(function (fieldId) {
            var field = document.getElementById(fieldId);
            if (!validateField(field)) {
                allGood = false;
                if (!firstBad) {
                    firstBad = field;
                }
            }
        });

        // Move the visitor to the first problem so they can fix it
        if (firstBad) {
            firstBad.focus();
        }
        return allGood;
    }

    /* ---------------------------------------------------------
       INSTANT FEEDBACK WHILE FILLING IN THE FORM
       --------------------------------------------------------- */
    Object.keys(rules).forEach(function (fieldId) {
        var field = document.getElementById(fieldId);

        // Check a field when the visitor leaves it
        field.addEventListener('blur', function () {
            validateField(field);
        });

        // If it already shows an error, re-check as they fix it
        field.addEventListener('input', function () {
            if (field.getAttribute('aria-invalid') === 'true') {
                validateField(field);
            }
        });
    });

    /* ---------------------------------------------------------
       FEEDBACK MESSAGES
       --------------------------------------------------------- */
    function showSuccess() {
        var name = document.getElementById('full-name').value.trim();
        var orderSelect = document.getElementById('order-type');
        var orderName = orderSelect.options[orderSelect.selectedIndex].text;

        statusBox.className = 'form-status success';
        statusBox.innerHTML =
            '<h3>Thank you, <span id="thanks-name"></span>!</h3>' +
            '<p>We have received your <strong id="thanks-order"></strong> enquiry. ' +
            'Our team will reply with a quote by email.</p>' +
            '<button type="button" id="send-another">Send another enquiry</button>';

        // textContent keeps anything the visitor typed safe
        document.getElementById('thanks-name').textContent = name;
        document.getElementById('thanks-order').textContent = orderName.toLowerCase();

        form.hidden = true;
        statusBox.focus();

        document.getElementById('send-another').addEventListener('click', function () {
            form.reset();
            form.hidden = false;
            statusBox.className = 'form-status';
            statusBox.innerHTML = '';
            document.getElementById('full-name').focus();
        });
    }

    function showFailure(message) {
        statusBox.className = 'form-status failure';
        statusBox.textContent = message;
        statusBox.focus();
    }

    /* ---------------------------------------------------------
       SUBMITTING THE FORM (AJAX with fetch)
       --------------------------------------------------------- */
    form.addEventListener('submit', function (event) {
        // Stop the normal page-reloading submit
        event.preventDefault();

        statusBox.className = 'form-status';
        statusBox.textContent = '';

        // Stop here if anything is wrong; the errors are already showing
        if (!validateAll()) {
            return;
        }

        // The form's action must be a real Formspree address
        if (form.action.indexOf('formspree.io/f/') === -1) {
            showFailure('This form is not connected yet. Please contact us by email instead.');
            return;
        }

        // Show that something is happening
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';

        // Send the form data in the background
        fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: { 'Accept': 'application/json' }
        })
        .then(function (response) {
            if (response.ok) {
                showSuccess();
            } else {
                showFailure('Sorry, something went wrong and your enquiry was not sent. ' +
                            'Please try again, or email us at info@solliesbakery.co.za.');
            }
        })
        .catch(function () {
            // Usually means the visitor's internet connection dropped
            showFailure('We could not reach the server. Please check your internet connection and try again.');
        })
        .then(function () {
            // Runs after success or failure: put the button back
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Enquiry';
        });
    });
});
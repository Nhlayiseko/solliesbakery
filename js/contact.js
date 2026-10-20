/* =========================================================
   contact.js - Sollie's Bakery (Part 3)
   General contact form on contact.html:
     1. Client-side validation with clear error messages
     2. A live character counter for the message box
     3. AJAX submission with fetch() that sends an email
        (through Formspree), with no page reload
   Only runs on pages that have #contact-form-element.
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

    var form = document.getElementById('contact-form-element');
    if (!form) {
        return; // not the contact page, so do nothing
    }

    var statusBox = document.getElementById('form-status');
    var submitButton = form.querySelector('button[type="submit"]');
    var messageField = document.getElementById('message');
    var maxMessageLength = 1000;

    /* ---------------------------------------------------------
       VALIDATION RULES
       Each rule gets the field's text and returns an error
       message, or an empty string if the value is fine.
       --------------------------------------------------------- */
    var rules = {

        'name': function (value) {
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
                return 'Please enter your email address so we can reply to you.';
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                return 'Please enter a valid email address, for example name@example.com.';
            }
            return '';
        },

        'subject': function (value) {
            if (value === '') {
                return 'Please enter a subject.';
            }
            if (value.length < 3) {
                return 'Your subject must be at least 3 characters long.';
            }
            if (value.length > 100) {
                return 'Please keep your subject under 100 characters (it is ' + value.length + ' now).';
            }
            return '';
        },

        'message': function (value) {
            if (value === '') {
                return 'Please type your message.';
            }
            if (value.length < 10) {
                return 'Your message is a little short. Please write at least 10 characters.';
            }
            if (value.length > maxMessageLength) {
                return 'Please keep your message under ' + maxMessageLength +
                       ' characters (it is ' + value.length + ' now).';
            }
            return '';
        }
    };

    /* ---------------------------------------------------------
       LIVE CHARACTER COUNTER under the message box
       --------------------------------------------------------- */
    var counter = document.createElement('span');
    counter.id = 'message-count';
    counter.className = 'char-count';
    counter.textContent = '0 / ' + maxMessageLength + ' characters';
    messageField.parentElement.appendChild(counter);

    messageField.addEventListener('input', function () {
        counter.textContent = messageField.value.length + ' / ' + maxMessageLength + ' characters';
        counter.classList.toggle('over-limit', messageField.value.length > maxMessageLength);
    });

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
        var name = document.getElementById('name').value.trim();

        statusBox.className = 'form-status success';
        statusBox.innerHTML =
            '<h3>Thank you, <span id="thanks-name"></span>!</h3>' +
            '<p>Your message has been sent to Sollie\'s Bakery. ' +
            'We will reply to you by email as soon as we can.</p>' +
            '<button type="button" id="send-another">Send another message</button>';

        // textContent keeps anything the visitor typed safe
        document.getElementById('thanks-name').textContent = name;

        form.hidden = true;
        statusBox.focus();

        document.getElementById('send-another').addEventListener('click', function () {
            form.reset();
            counter.textContent = '0 / ' + maxMessageLength + ' characters';
            form.hidden = false;
            statusBox.className = 'form-status';
            statusBox.innerHTML = '';
            document.getElementById('name').focus();
        });
    }

    function showFailure(message) {
        statusBox.className = 'form-status failure';
        statusBox.textContent = message;
        statusBox.focus();
    }

    /* ---------------------------------------------------------
       SENDING THE MESSAGE (AJAX with fetch)
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
            showFailure('This form is not connected yet. Please email us at info@solliesbakery.co.za instead.');
            return;
        }

        // Show that something is happening
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';

        // Collect the form data, then give the email a useful subject line
        var formData = new FormData(form);
        formData.set('_subject', 'Contact message: ' + document.getElementById('subject').value.trim());

        // Send the form data in the background
        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' }
        })
        .then(function (response) {
            if (response.ok) {
                showSuccess();
            } else {
                showFailure('Sorry, something went wrong and your message was not sent. ' +
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
            submitButton.textContent = 'Send Message';
        });
    });
});
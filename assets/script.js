function isMobileDevice() {
  return /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
}

document.addEventListener('DOMContentLoaded', function () {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
  // Add skip link for accessibility
  if (!document.querySelector('.skip-link')) {
    const skipLink = document.createElement('a');
    skipLink.className = 'skip-link';
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  // Add mobile menu toggle
  const header = document.querySelector('header');
  const nav = document.querySelector('nav');
  if (header && nav && !document.querySelector('.nav-toggle')) {
    const toggle = document.createElement('button');
    toggle.className = 'nav-toggle';
    toggle.type = 'button';
    toggle.innerHTML = 'Menu';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'main-navigation');
    header.appendChild(toggle);

    nav.id = 'main-navigation';
    toggle.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }

  // Make "Book Online" links open SMS on mobile devices
  document.querySelectorAll('a[href="booking.html"]').forEach((el) => {
    el.addEventListener('click', function (e) {
      if (isMobileDevice()) {
        e.preventDefault();
        const body = encodeURIComponent('Hello, I would like to book a service.');
        window.location.href = 'sms:+19086722526?body=' + body;
      }
    });
  });
});

// Cross-device handlers: call, SMS, and desktop modal fallback
(function () {
  const PHONE_NUMBER = '+19086722526';

  function isMobileDevice() {
    return /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
  }

  // If a booking link is clicked on desktop, show a modal with a small form
  function ensureBookingHandlers() {
    const bookingSelectors = 'a[href="booking.html"], a.book-online';
    document.querySelectorAll(bookingSelectors).forEach((el) => {
      el.addEventListener('click', function (e) {
        if (isMobileDevice()) {
          return; // mobile handled earlier
        }
        e.preventDefault();
        showContactModal();
      });
    });

    // Intercept explicit sms: links on desktop to show modal instead
    document.querySelectorAll('a[href^="sms:"]').forEach((el) => {
      el.addEventListener('click', function (e) {
        if (!isMobileDevice()) {
          e.preventDefault();
          showContactModal();
        }
      });
    });

    // Ensure tel: links try to open directly; on desktop copy number to clipboard
    document.querySelectorAll('a[href^="tel:"]').forEach((el) => {
      el.addEventListener('click', function (e) {
        if (!isMobileDevice()) {
          e.preventDefault();
          const phone = (el.getAttribute('href') || '').replace(/^tel:/, '');
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(phone).then(() => {
              alert('This device may not place phone calls. The number has been copied to your clipboard: ' + phone + '\nUse your phone to call or use the Email button to contact us.');
            }).catch(() => {
              alert('Please call or text this number from your phone: ' + phone + '\nOr email service@ashvac.com.');
            });
          } else {
            alert('Please call or text this number from your phone: ' + phone + '\nOr email service@ashvac.com.');
          }
        }
      });
    });
  }

  // Create and show modal
  function showContactModal() {
    let overlay = document.getElementById('contact-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'contact-modal-overlay';
      overlay.innerHTML = '' +
        '<div class="contact-modal" role="dialog" aria-modal="true">' +
          '<button class="modal-close" aria-label="Close">✕</button>' +
          '<h3>Book Service / Contact</h3>' +
          '<div class="modal-body">' +
            '<label>Name<br><input id="modal-name" type="text" placeholder="Your name"></label>' +
            '<label>Phone<br><input id="modal-phone" type="text" placeholder="Your phone"></label>' +
            '<label>Address<br><input id="modal-address" type="text" placeholder="Service address"></label>' +
            '<label>Details<br><textarea id="modal-message" rows="4" placeholder="Describe the issue"></textarea></label>' +
          '</div>' +
          '<div class="modal-actions">' +
            '<button id="modal-send-sms" class="btn">Send SMS</button>' +
            '<a id="modal-call-now" class="btn btn-secondary" href="tel:' + PHONE_NUMBER + '">Call Now</a>' +
            '<button id="modal-copy" class="btn btn-secondary">Copy Number</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(overlay);

      overlay.querySelector('.modal-close').addEventListener('click', hideContactModal);
      overlay.addEventListener('click', function (e) { if (e.target === overlay) hideContactModal(); });

      overlay.querySelector('#modal-copy').addEventListener('click', function () {
        navigator.clipboard?.writeText(PHONE_NUMBER).then(function () {
          alert('Phone number copied: ' + PHONE_NUMBER);
        }, function () {
          prompt('Copy this number', PHONE_NUMBER);
        });
      });

      overlay.querySelector('#modal-send-sms').addEventListener('click', async function () {
        const name = document.getElementById('modal-name')?.value.trim() || '';
        const phone = document.getElementById('modal-phone')?.value.trim() || '';
        const address = document.getElementById('modal-address')?.value.trim() || '';
        const message = document.getElementById('modal-message')?.value.trim() || '';

        const payload = { name, phone, address, message, preferCall: false };

        // On mobile try direct SMS first
        if (isMobileDevice()) {
          const body = `New HVAC Request:\nName: ${name}\nPhone: ${phone}\nAddress: ${address}\nDetails: ${message}`;
          window.location.href = 'sms:' + PHONE_NUMBER + '?body=' + encodeURIComponent(body);
          hideContactModal();
          return;
        }

        // On desktop, POST to server API (/api/book). Server will use Twilio/email/file.
        try {
          const resp = await fetch('/api/book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const data = await resp.json();
          if (data && data.ok) {
            alert('Booking request sent (' + (data.via || 'unknown') + '). We will contact you shortly.');
            hideContactModal();
            return;
          }
        } catch (err) {
          console.warn('API request failed', err);
        }

        // Fallback: open the user's email client with the completed message
        const fallback = `New HVAC Request:\nName: ${name}\nPhone: ${phone}\nAddress: ${address}\nDetails: ${message}`;
        const mailto = 'mailto:service@ashvac.com?subject=' + encodeURIComponent('HVAC Service Request') + '&body=' + encodeURIComponent(fallback);
        window.location.href = mailto;
        hideContactModal();
      });
    }
    overlay.style.display = 'flex';
  }

  function hideContactModal() {
    const overlay = document.getElementById('contact-modal-overlay');
    if (overlay) overlay.style.display = 'none';
  }

  // Initialize handlers on DOM ready
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    ensureBookingHandlers();
  } else {
    document.addEventListener('DOMContentLoaded', ensureBookingHandlers);
  }
})();

function sendSMS() {
  const service = document.getElementById('service')?.value || 'Service request';
  const name = document.getElementById('name')?.value.trim();
  const phone = document.getElementById('phone')?.value.trim();
  const address = document.getElementById('address')?.value.trim();
  const message = document.getElementById('message')?.value.trim() || document.getElementById('details')?.value.trim() || '';

  if (!name || !phone || !address) {
    alert('Please fill in your name, phone number, and address.');
    return;
  }

  const bodyText = 'New HVAC Request:\n' +
    'Service: ' + service + '\n' +
    'Name: ' + name + '\n' +
    'Phone: ' + phone + '\n' +
    'Address: ' + address + '\n' +
    'Details: ' + message;

  if (isMobileDevice()) {
    window.location.href = 'sms:+19086722526?body=' + encodeURIComponent(bodyText);
    return;
  }

  // Try server booking API if available
  fetch('/api/book', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ service, name, phone, address, message, preferCall: false }),
  })
    .then((resp) => resp.json())
    .then((data) => {
      if (data && data.ok) {
        alert('Booking request sent (' + (data.via || 'server') + '). We will contact you shortly.');
      } else {
        throw new Error('Booking API failed');
      }
    })
    .catch(() => {
      const mailto = 'mailto:service@ashvac.com?subject=' + encodeURIComponent('HVAC Service Request: ' + service) + '&body=' + encodeURIComponent(bodyText);
      window.location.href = mailto;
    });
}

function sendEmail() {
  const service = document.getElementById('service')?.value || 'Service request';
  const name = document.getElementById('name')?.value.trim();
  const phone = document.getElementById('phone')?.value.trim();
  const address = document.getElementById('address')?.value.trim();
  const message = document.getElementById('message')?.value.trim() || document.getElementById('details')?.value.trim() || '';

  if (!name || !phone || !address) {
    alert('Please fill in your name, phone number, and address.');
    return;
  }

  const subject = 'HVAC Service Request: ' + service;
  const bodyText = 'Name: ' + name + '\n' +
    'Phone: ' + phone + '\n' +
    'Address: ' + address + '\n' +
    'Details: ' + message;
  window.location.href = 'mailto:service@ashvac.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(bodyText);
}

function copyRequest() {
  const service = document.getElementById('service')?.value || document.getElementById('serviceType')?.value || 'Service request';
  const name = document.getElementById('name')?.value.trim() || '';
  const phone = document.getElementById('phone')?.value.trim() || '';
  const address = document.getElementById('address')?.value.trim() || '';
  const message = document.getElementById('message')?.value.trim() || document.getElementById('details')?.value.trim() || '';

  const full = 'New HVAC Request:\n' +
    'Service: ' + service + '\n' +
    'Name: ' + name + '\n' +
    'Phone: ' + phone + '\n' +
    'Address: ' + address + '\n' +
    'Details: ' + message;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(full).then(() => {
      alert('Request copied to clipboard. Paste into your phone Messages app or email composer.');
    }).catch(() => {
      window.prompt('Copy the request text below (Ctrl+C):', full);
    });
  } else {
    window.prompt('Copy the request text below (Ctrl+C):', full);
  }
}

function copyPhoneNumber() {
  const phone = '+1 908 672 2526';
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(phone).then(() => {
      alert('Phone number copied to clipboard: ' + phone);
    }).catch(() => {
      window.prompt('Copy this number', phone);
    });
  } else {
    window.prompt('Copy this number', phone);
  }
}

function calculatePrice() {
  const price = document.getElementById('serviceType')?.value || '0';
  const priceResult = document.getElementById('priceResult');
  if (priceResult) {
    priceResult.textContent = 'Estimated Cost: $' + price;
  }
}

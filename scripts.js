function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function openWhatsApp() {
  window.open("https://wa.me/19735896304", "_blank", "noopener,noreferrer");
}

function handleFormSubmit(event) {
  event.preventDefault();
  const statusEl = document.getElementById("formStatus");
  statusEl.classList.remove("success", "error");

  const formData = {
    name: event.target.name.value.trim(),
    phone: event.target.phone.value.trim(),
    serviceType: event.target.serviceType.value,
    message: event.target.message.value.trim(),
    timestamp: new Date().toISOString()
  };

  const endpoint = "https://example.com/api/contact";

  fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(formData)
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      statusEl.textContent = "Your request has been submitted. We will follow up shortly.";
      statusEl.classList.add("success");
      event.target.reset();
    })
    .catch(() => {
      statusEl.textContent = "Unable to submit your request to the service. Please call (973) 589‑6304 directly.";
      statusEl.classList.add("error");
    });
}

function initPage() {
  document.getElementById("year").textContent = new Date().getFullYear();

  const scheduleButton = document.querySelector('.btn-schedule');
  const estimateButton = document.querySelector('.btn-estimate');
  const emergencyButton = document.querySelector('.btn-emergency');
  const requestServiceButton = document.getElementById('requestServiceButton');
  const contactForm = document.getElementById('contactForm');
  const btn = document.querySelector('.mobile-nav-toggle');
  const header = document.querySelector('header');
  const nav = document.getElementById('navlinks');

  if (scheduleButton) {
    scheduleButton.addEventListener('click', () => scrollToSection('contact'));
  }

  if (estimateButton) {
    estimateButton.addEventListener('click', () => scrollToSection('contact'));
  }

  if (emergencyButton) {
    emergencyButton.addEventListener('click', openWhatsApp);
  }

  if (requestServiceButton) {
    requestServiceButton.addEventListener('click', () => scrollToSection('contact'));
  }

  if (contactForm) {
    contactForm.addEventListener('submit', handleFormSubmit);
  }

  if (btn && nav && header) {
    btn.addEventListener('click', function () {
      const expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!expanded));
      header.classList.toggle('nav-open');
    });

    document.addEventListener('click', function (e) {
      if (!header.classList.contains('nav-open')) return;
      if (nav.contains(e.target) || btn.contains(e.target)) return;
      header.classList.remove('nav-open');
      btn.setAttribute('aria-expanded', 'false');
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('nav-open')) {
        header.classList.remove('nav-open');
        btn.setAttribute('aria-expanded', 'false');
        btn.focus();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', initPage);

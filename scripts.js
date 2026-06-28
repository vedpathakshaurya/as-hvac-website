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

  try {
    const existing = JSON.parse(localStorage.getItem("as_hvac_requests") || "[]");
    existing.push(formData);
    localStorage.setItem("as_hvac_requests", JSON.stringify(existing));
    statusEl.textContent = "Your request has been saved in this browser so you can reference it later.";
    statusEl.classList.add("success");
    event.target.reset();
  } catch (e) {
    statusEl.textContent = "Unable to save your request locally. You can still call directly at (973) 589‑6304.";
    statusEl.classList.add("error");
  }
}

function initPage() {
  document.getElementById("year").textContent = new Date().getFullYear();

  const callButton = document.querySelector('.btn-call');
  const scheduleButton = document.querySelector('.btn-schedule');
  const requestServiceButton = document.getElementById('requestServiceButton');
  const contactForm = document.getElementById('contactForm');
  const btn = document.querySelector('.mobile-nav-toggle');
  const header = document.querySelector('header');
  const nav = document.getElementById('navlinks');

  if (callButton) {
    callButton.addEventListener('click', openWhatsApp);
  }

  if (scheduleButton) {
    scheduleButton.addEventListener('click', () => scrollToSection('contact'));
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

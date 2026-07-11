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
  if (!statusEl) return;
  statusEl.classList.remove("success", "error");

  const name = event.target.name.value.trim();
  const phone = event.target.phone.value.trim();
  const serviceType = event.target.serviceType.value;
  const message = event.target.message.value.trim();

  if (!name || !phone || !serviceType || !message) {
    statusEl.textContent = "Please fill in all fields before submitting your request.";
    statusEl.classList.add("error");
    return;
  }

  const formData = {
    name,
    phone,
    serviceType,
    message,
    timestamp: new Date().toISOString()
  };

  const endpoint = event.target.action || "";
  const fallbackWhatsApp = "https://wa.me/19735896304";
  const whatsappText = encodeURIComponent(
    `Callback request from ${name}%0APhone: ${phone}%0AService: ${serviceType}%0AMessage: ${message}`
  );

  statusEl.textContent = "Thanks! Your callback request is ready. We will follow up shortly.";
  statusEl.classList.add("success");
  event.target.reset();

  if (!endpoint || endpoint.includes("example.com") || window.location.protocol === "file:") {
    window.open(`${fallbackWhatsApp}?text=${whatsappText}`, "_blank");
    return;
  }

  fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(formData)
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Request failed");
      }
      return response.json().catch(() => ({}));
    })
    .catch(() => {
      window.open(`${fallbackWhatsApp}?text=${whatsappText}`, "_blank");
    });
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

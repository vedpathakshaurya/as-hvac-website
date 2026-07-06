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

function initPage() {
  document.getElementById("year").textContent = new Date().getFullYear();

  const scheduleButtons = document.querySelectorAll('.btn-schedule');
  const estimateButtons = document.querySelectorAll('.btn-estimate');
  const emergencyButtons = document.querySelectorAll('.btn-emergency');
  const requestServiceButton = document.getElementById('requestServiceButton');
  const askAiButton = document.getElementById('askAiButton');
  const heroAskAiButton = document.getElementById('heroAskAiButton');
  const talkAdvisorButton = document.getElementById('talkAdvisorButton');
  const aiInput = document.getElementById('aiInput');
  const aiSendButton = document.getElementById('aiSendButton');
  const askAiQuickButton = document.getElementById('askAiQuickButton');
  const reasoningToggle = document.getElementById('aiReasoningToggle');
  const aiActionSchedule = document.getElementById('aiActionSchedule');
  const AI_API_ENDPOINT = window.location.protocol === 'file:' ? null : '/api/ask';
  const aiActionEstimate = document.getElementById('aiActionEstimate');
  const aiActionFinancing = document.getElementById('aiActionFinancing');
  const aiChatWindow = document.getElementById('aiChatWindow');
  const contactForm = document.getElementById('contactForm');
  const btn = document.querySelector('.mobile-nav-toggle');
  const header = document.querySelector('header');
  const nav = document.getElementById('navlinks');

  function appendAiMessage(text, isUser = false) {
    if (!aiChatWindow) return;
    const message = document.createElement('div');
    message.className = `ai-message ${isUser ? 'ai-message-user' : 'ai-message-bot'}`;
    // user messages should be plain text; bot replies use minimal HTML for structure
    if (isUser) {
      message.textContent = text;
    } else {
      message.innerHTML = text;
    }
    aiChatWindow.appendChild(message);
    aiChatWindow.scrollTop = aiChatWindow.scrollHeight;
  }

  function getAiResponse(query) {
    const input = query.toLowerCase().trim();
    if (!input) {
      return 'Please tell me a little more about what you need help with. I can answer HVAC questions, home tips, or general topics.';
    }

    if (input.includes('what time') || input.includes('current time')) {
      return `The current time is ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}.`;
    }

    if (input.includes('what day') || input.includes('what date') || input.includes('today')) {
      return `Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}.`;
    }

    const rules = [
      {
        pattern: /(replace|new system|install|replacement|upgrade|efficiency)/,
        response: 'A replacement can be a smart choice when your system is older, repairs are frequent, or you want better energy efficiency. I can help compare project costs and financing options.'
      },
      {
        pattern: /(repair|fix|broken|not cooling|not heating|leak|noisy|fault)/,
        response: 'Repair is often the right answer when the issue is limited and the system is still in good shape. I recommend a technician inspection so you can avoid unnecessary replacement costs.'
      },
      {
        pattern: /(finance|financ|payment|budget|monthly|loan|offer)/,
        response: 'We have financing options and can help identify local rebates to lower your upfront cost. A monthly plan can make replacement or repair more affordable.'
      },
      {
        pattern: /(maintenance|tune|service|inspection|clean)/,
        response: 'Regular maintenance keeps your HVAC running efficiently and helps avoid unexpected breakdowns. Seasonal tune-ups are one of the best ways to protect your system.'
      },
      {
        pattern: /(seer|energy|savings|efficiency|cost)/,
        response: 'Higher efficiency systems often reduce operating costs. I can explain how an upgrade may save you money over the next few years.'
      },
      {
        pattern: /(warranty|trust|reliable|local|licensed)/,
        response: 'A trusted local HVAC contractor should offer clear warranty support and transparent pricing. We focus on honest recommendations and dependable service.'
      },
      {
        pattern: /(weather|forecast|temperature|sunny|rain|snow)/,
        response: 'I can help with general weather questions, but for exact local conditions use a weather service. In Newark, summers are typically hot and humid while winters can be cold and snowy.'
      },
      {
        pattern: /(history|when was|who was|ancient|years ago|history of)/,
        response: 'History is a great topic. Tell me the event, place, or person, and I can give you a concise summary and key facts.'
      },
      {
        pattern: /(how to|how do i|how can i|guide|tutorial)/,
        response: 'I can walk you through steps for many topics, from HVAC troubleshooting to home improvement and everyday problems. Ask your question and I will give clear steps.'
      },
      {
        pattern: /(recipe|cook|bake|ingredients|meal|kitchen)/,
        response: 'I can suggest recipes and cooking tips. Let me know what ingredients you have and I’ll help you build a simple meal or solve a kitchen question.'
      },
      {
        pattern: /(math|calculate|sum|difference|percent|divide|times|equation)/,
        response: 'I can help with basic math and calculations. Tell me the numbers and I’ll provide the result and how I arrived at it.'
      },
      {
        pattern: /(travel|trip|destination|flight|hotel|vacation)/,
        response: 'I can offer travel tips and planning ideas, including what to consider for destination choice, packing, and timing.'
      },
      {
        pattern: /(what is|who is|where is|why is|why does|when did|what are|should i|can i|is it|do i need|best way to|can you help|hello|hi|hey|thanks|thank you|good morning|good afternoon|good evening)/,
        response: 'I focus on HVAC questions and practical home comfort guidance. Ask me about your system, maintenance, repairs, or replacement options and I’ll keep the answer useful and relevant.'
      }
    ];

    for (const rule of rules) {
      if (rule.pattern.test(input)) {
        return rule.response;
      }
    }

    if (input.includes('repair') && input.includes('replace')) {
      return 'Both repair and replacement may be options. If repairs are recurring or the system is older, replacement is usually the better long-term choice. If the issue is isolated, repair can still be a good value.';
    }

    // general fallback for broader questions
    return 'I can help with HVAC questions, home improvement, general knowledge, math, travel, cooking, fitness, programming, and everyday advice. Ask me anything in plain language and I’ll answer it clearly.';
  }

  function sendAiQuestion(question) {
    if (!question || !aiInput) return;
    const trimmed = question.trim();
    if (!trimmed) return;
    appendAiMessage(trimmed, true);
    aiInput.value = '';

    const thinking = document.createElement('div');
    thinking.className = 'ai-message ai-message-bot';
    thinking.textContent = 'Checking local guidance…';
    aiChatWindow.appendChild(thinking);
    aiChatWindow.scrollTop = aiChatWindow.scrollHeight;

    const payload = { message: trimmed };
    const useBackend = Boolean(AI_API_ENDPOINT);
    const offlineMode = typeof navigator !== 'undefined' && !navigator.onLine;

    if (!useBackend || offlineMode) {
      const fallback = getAiResponse(trimmed);
      appendAiMessage(formatAiText(`${fallback}${offlineMode ? '<p><small>Offline mode is active.</small></p>' : ''}`), false);
      if (aiChatWindow.contains(thinking)) {
        aiChatWindow.removeChild(thinking);
      }
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 4000);

    fetch(AI_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      body: JSON.stringify(payload),
      signal: controller.signal
    })
      .then(async (response) => {
        const text = await response.text();
        let data = null;
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          if (!response.ok) {
            throw new Error(text || 'AI server error');
          }
          throw new Error('Invalid response from AI server.');
        }

        if (!response.ok || data?.error) {
          const errorMessage = data?.error || text || 'AI server error';
          throw new Error(errorMessage);
        }

        return data;
      })
      .then((data) => {
        const raw = data.answer || 'No answer returned from the AI server.';
        appendAiMessage(formatAiText(raw), false);
      })
      .catch((error) => {
        const fallback = getAiResponse(trimmed);
        const note = error.name === 'AbortError' ? 'The AI server took too long, so local guidance was used.' : (error.message || 'The AI server was unavailable.');
        appendAiMessage(formatAiText(`${fallback}<p><small>Note: ${note}</small></p>`), false);
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
        if (aiChatWindow.contains(thinking)) {
          aiChatWindow.removeChild(thinking);
        }
      });
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function formatAiText(text) {
    const safe = escapeHtml(String(text));
    return safe
      .split(/\n\n+/)
      .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br/>')}</p>`)
      .join('');
  }

  scheduleButtons.forEach((button) => {
    button.addEventListener('click', () => scrollToSection('contact'));
  });

  estimateButtons.forEach((button) => {
    button.addEventListener('click', () => scrollToSection('contact'));
  });

  emergencyButtons.forEach((button) => {
    button.addEventListener('click', openWhatsApp);
  });

  if (askAiButton) {
    askAiButton.addEventListener('click', () => {
      scrollToSection('ai');
      if (aiInput) {
        aiInput.focus();
      }
    });
  }

  if (heroAskAiButton) {
    heroAskAiButton.addEventListener('click', (event) => {
      event.preventDefault();
      scrollToSection('ai');
      if (aiInput) {
        aiInput.focus();
      }
    });
  }

  if (askAiQuickButton) {
    askAiQuickButton.addEventListener('click', () => sendAiQuestion('Should I repair or replace my HVAC system?'));
  }
  if (talkAdvisorButton) {
    talkAdvisorButton.addEventListener('click', () => scrollToSection('contact'));
  }

  if (aiActionSchedule) {
    aiActionSchedule.addEventListener('click', () => scrollToSection('contact'));
  }
  if (aiActionEstimate) {
    aiActionEstimate.addEventListener('click', () => scrollToSection('replacement'));
  }
  if (aiActionFinancing) {
    aiActionFinancing.addEventListener('click', () => scrollToSection('financing'));
  }

  if (aiSendButton) {
    aiSendButton.addEventListener('click', () => sendAiQuestion(aiInput.value.trim()));
  }

  if (aiInput) {
    aiInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        sendAiQuestion(aiInput.value.trim());
      }
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

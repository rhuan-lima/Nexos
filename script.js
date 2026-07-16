/* ==========
  Configuração rápida (edite aqui)
  - whatsappNumber: no formato internacional sem "+" e sem espaços (ex.: 5581999999999)
  - displayPhone: como deve aparecer na tela
========== */
const CONFIG = {
  whatsappNumber: "5581988530483",
  displayPhone: "(81) 98853-0483",
};

const SECTION_IDS = ["servicos", "diferenciais", "area", "contato"];

function onlyDigits(value) {
  return String(value || "").replace(/\D+/g, "");
}

function buildWhatsAppUrl(numberDigits, text) {
  return `https://wa.me/${numberDigits}?text=${encodeURIComponent(text)}`;
}

function getContextMessage({ name, phone, message }) {
  return [
    "Olá! Gostaria de um orçamento com a Nexus Projetos e Instalações.",
    "",
    `Nome: ${name}`,
    `Telefone: ${phone}`,
    "",
    "Detalhes:",
    message,
    "",
    "Atendimento: Recife e Região Metropolitana.",
  ].join("\n");
}

function setupYear() {
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
}

function setupPhoneLinks() {
  const digits = onlyDigits(CONFIG.whatsappNumber);
  const phoneLink = `tel:+${digits}`;
  document.querySelectorAll("[data-phone-link]").forEach((a) => {
    a.textContent = CONFIG.displayPhone;
    a.setAttribute("href", phoneLink);
  });
}

function setupWhatsAppLinks() {
  const digits = onlyDigits(CONFIG.whatsappNumber);
  const defaultText =
    "Olá! Quero solicitar um orçamento. Tipo de serviço: (instalação / manutenção / teste de estanqueidade / conversão GN). Endereço/bairro: ";
  const url = buildWhatsAppUrl(digits, defaultText);
  document.querySelectorAll("[data-whatsapp-link]").forEach((a) => {
    a.setAttribute("href", url);
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener noreferrer");
  });
}

function setupMobileNav() {
  const nav = document.querySelector("[data-nav]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const panel = document.querySelector("[data-nav-panel]");
  if (!nav || !toggle || !panel) return;

  const close = () => {
    nav.classList.remove("nav--open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menu");
    document.documentElement.classList.remove("no-scroll");
  };

  const open = () => {
    nav.classList.add("nav--open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Fechar menu");
    document.documentElement.classList.add("no-scroll");
  };

  toggle.addEventListener("click", () => {
    if (nav.classList.contains("nav--open")) close();
    else open();
  });

  panel.addEventListener("click", (e) => {
    const target = e.target;
    if (target instanceof HTMLAnchorElement && target.getAttribute("href")?.startsWith("#")) {
      close();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  document.addEventListener("click", (e) => {
    if (!nav.classList.contains("nav--open")) return;
    const target = e.target;
    if (!(target instanceof Node)) return;
    if (!nav.contains(target)) close();
  });
}

function setupActiveNavLink() {
  const navLinks = document.querySelectorAll("[data-nav-link]");
  const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean);
  if (!navLinks.length || !sections.length) return;

  const setActive = (id) => {
    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      const isActive = href === `#${id}`;
      if (isActive) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  };

  if (!("IntersectionObserver" in window)) return;

  const visible = new Map();

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        visible.set(entry.target.id, entry.intersectionRatio);
      });

      let bestId = null;
      let bestRatio = 0;
      visible.forEach((ratio, id) => {
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestId = id;
        }
      });

      if (bestId) setActive(bestId);
    },
    { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.1, 0.25, 0.5] }
  );

  sections.forEach((section) => io.observe(section));
}

function setupRevealAnimations() {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;

  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  els.forEach((el) => io.observe(el));
}

function animateCounters() {
  const counters = document.querySelectorAll("[data-counter]");
  if (!counters.length) return;

  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  const run = (el) => {
    const target = Number(el.getAttribute("data-counter") || "0");
    if (!Number.isFinite(target)) return;
    if (reduce) {
      el.textContent = String(target);
      return;
    }

    const duration = 900;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  if (!("IntersectionObserver" in window)) {
    counters.forEach(run);
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          run(entry.target);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((c) => io.observe(c));
}

function setupLeadForm() {
  const form = document.querySelector("[data-lead-form]");
  if (!(form instanceof HTMLFormElement)) return;

  const digits = onlyDigits(CONFIG.whatsappNumber);

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    const name = String(fd.get("nome") || "").trim();
    const phone = String(fd.get("telefone") || "").trim();
    const message = String(fd.get("mensagem") || "").trim();

    if (!name || !phone || !message) {
      const firstInvalid = form.querySelector(":invalid");
      if (firstInvalid instanceof HTMLElement) firstInvalid.focus();
      return;
    }

    const url = buildWhatsAppUrl(digits, getContextMessage({ name, phone, message }));
    window.open(url, "_blank", "noopener,noreferrer");
    form.reset();
  });
}

function ensureValidConfig() {
  const digits = onlyDigits(CONFIG.whatsappNumber);
  const isPlaceholder = CONFIG.whatsappNumber.includes("X") || digits.length < 10;
  if (!isPlaceholder) return;

  const fallback = "https://web.whatsapp.com/";
  document.querySelectorAll("[data-whatsapp-link]").forEach((a) => {
    a.setAttribute("href", fallback);
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener noreferrer");
  });
}

function init() {
  setupYear();
  setupPhoneLinks();
  setupWhatsAppLinks();
  ensureValidConfig();
  setupMobileNav();
  setupActiveNavLink();
  setupRevealAnimations();
  animateCounters();
  setupLeadForm();
}

init();

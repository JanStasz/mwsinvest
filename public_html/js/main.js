/* ============================================================
   MWS INVEST — interactions
   Plain (vanilla) JavaScript, no libraries. Each block is
   commented so it's easy to follow and tweak.
   ============================================================ */

/* Run everything once the HTML is parsed. */
document.addEventListener("DOMContentLoaded", () => {
  setupNav();
  setupMobileMenu();
  setupScrollReveal();
  setupCounters();
  setupContactForm();
  setupMap();

  // Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

/* ---------- 1. Sticky nav: turn solid after scrolling ---------- */
function setupNav() {
  const nav = document.getElementById("nav");
  const onScroll = () => {
    // add the white/solid style once we've scrolled a bit
    nav.classList.toggle("nav--solid", window.scrollY > 60);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ---------- 2. Mobile menu (hamburger) ---------- */
function setupMobileMenu() {
  const nav = document.getElementById("nav");
  const burger = document.getElementById("navBurger");
  const links = document.getElementById("navLinks");

  const close = () => {
    links.classList.remove("is-open");
    nav.classList.remove("nav--menu-open");
    burger.setAttribute("aria-expanded", "false");
  };

  burger.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    nav.classList.toggle("nav--menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
  });

  // close the menu after a link is tapped
  links.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
}

/* ---------- 3. Scroll reveal (fade/slide elements in) ---------- */
function setupScrollReveal() {
  const items = document.querySelectorAll(".reveal");

  // IntersectionObserver tells us when an element enters the viewport.
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target); // animate only once
        }
      });
    },
    { threshold: 0.15 }
  );

  items.forEach((el) => observer.observe(el));
}

/* ---------- 4. Animated number counters ---------- */
function setupCounters() {
  const counters = document.querySelectorAll(".count");

  const animate = (el) => {
    const target = Number(el.dataset.target);
    const duration = 1500; // ms
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      // ease-out so it slows down near the end
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  counters.forEach((el) => observer.observe(el));
}

/* ---------- 5. Contact form (front-end only demo) ---------- */
function setupContactForm() {
  const form = document.getElementById("contactForm");
  const note = document.getElementById("formNote");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault(); // stop the page from reloading

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    // very simple validation
    if (!name || !email || !message) {
      note.style.color = "var(--red)";
      note.textContent = "Please fill in every field.";
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      note.style.color = "var(--red)";
      note.textContent = "Please enter a valid email address.";
      return;
    }

    // NOTE: there is no backend yet, so we just confirm visually.
    // Later you can connect this to email or a form service.
    note.style.color = "#1a9e54";
    note.textContent = "Thank you — your message has been noted. We'll be in touch.";
    form.reset();
  });
}

/* ---------- 6. Interactive Europe map ---------- */
function setupMap() {
  const container = document.getElementById("mapContainer");
  if (!container) return;

  // Once we have the SVG (however it arrived) wire up the highlights.
  const init = (svg) => {
    container.removeAttribute("aria-busy");

    // Highlight our two markets
    ["PL", "CH"].forEach((code) => {
      const country = svg.querySelector("#" + code);
      if (country) country.classList.add("is-highlight");
    });

    linkMarketCards(svg, container);
  };

  // If the SVG is already embedded in the page (self-contained build),
  // use it directly. Otherwise fetch it from the assets folder.
  const inlineSvg = container.querySelector("svg");
  if (inlineSvg) {
    init(inlineSvg);
    return;
  }

  fetch("assets/europe.svg")
    .then((res) => res.text())
    .then((svgText) => {
      container.innerHTML = svgText;
      init(container.querySelector("svg"));
    })
    .catch(() => {
      container.innerHTML =
        '<p class="map__loading">Map could not be loaded.</p>';
    });
}

/* Connect the Poland/Switzerland info cards to the map. */
function linkMarketCards(svg, mapContainer) {
  const cards = document.querySelectorAll(".market-card");

  const focusCountry = (code) => {
    mapContainer.classList.add("is-focused");
    svg.querySelectorAll(".country.is-highlight").forEach((el) => {
      el.style.fill = el.id === code ? "" : "var(--red-dark)";
      el.style.opacity = el.id === code ? "1" : "0.45";
    });
  };

  const reset = () => {
    mapContainer.classList.remove("is-focused");
    svg.querySelectorAll(".country.is-highlight").forEach((el) => {
      el.style.fill = "";
      el.style.opacity = "1";
    });
  };

  cards.forEach((card) => {
    const code = card.dataset.country;

    // hovering a card highlights only its country on the map
    card.addEventListener("mouseenter", () => focusCountry(code));
    card.addEventListener("mouseleave", reset);
  });
}

/* ============================================================
   APEX R&M GROUP — script.js
   Main JavaScript — All interactions, animations, UI
   ============================================================ */

'use strict';

/* --- Loading Screen --- */
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('hidden');
  }, 1800);
});

/* --- Scroll Progress --- */
function updateScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  bar.style.width = (scrollTop / docHeight * 100) + '%';
}

/* --- Navbar Scroll Effect --- */
function handleNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

/* --- Scroll to Top --- */
function handleScrollTop() {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;
  if (window.scrollY > 400) {
    btn.classList.add('visible');
  } else {
    btn.classList.remove('visible');
  }
}

document.getElementById('scroll-top')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* --- Combined Scroll Handler --- */
window.addEventListener('scroll', () => {
  updateScrollProgress();
  handleNavbar();
  handleScrollTop();
  revealOnScroll();
  if (countersStarted === false) checkCounters();
}, { passive: true });

/* --- Mobile Menu --- */
const navToggle  = document.querySelector('.nav-toggle');
const navMobile  = document.querySelector('.nav-mobile');
const navBackdrop = document.querySelector('.nav-backdrop');
const mobileClose = document.querySelector('.nav-mobile-close');
const mobileLinks = document.querySelectorAll('.nav-mobile a');

function openMobileMenu() {
  navToggle?.classList.add('open');
  navMobile?.classList.add('open');
  navBackdrop?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeMobileMenu() {
  navToggle?.classList.remove('open');
  navMobile?.classList.remove('open');
  navBackdrop?.classList.remove('open');
  document.body.style.overflow = '';
}

navToggle?.addEventListener('click', () => {
  navMobile?.classList.contains('open') ? closeMobileMenu() : openMobileMenu();
});
mobileClose?.addEventListener('click', closeMobileMenu);
navBackdrop?.addEventListener('click', closeMobileMenu);
mobileLinks.forEach(link => link.addEventListener('click', closeMobileMenu));

/* --- Scroll Reveal --- */
function revealOnScroll() {
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  reveals.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 80) {
      el.classList.add('revealed');
    }
  });
}
revealOnScroll(); // Run on load

/* --- Animated Counters --- */
let countersStarted = false;

function checkCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  const firstCounter = counters[0];
  const rect = firstCounter.getBoundingClientRect();
  if (rect.top < window.innerHeight) {
    countersStarted = true;
    counters.forEach(counter => animateCounter(counter));
  }
}

/* Exposed so home-cms.js can force a fresh run once it has updated
   data-count with the real saved values — otherwise a visitor who
   scrolls past this section before that fetch resolves would have
   already animated to the old static defaults and never see the
   real numbers, since checkCounters() only ever runs once. */
window.apexRestartCounters = function () {
  countersStarted = false;
  checkCounters();
};

function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  if (Number.isNaN(target)) return; // non-numeric stat (e.g. "Rwanda") — leave the static text alone
  const duration = 2000;
  const start = performance.now();
  function update(time) {
    const elapsed = time - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }
  requestAnimationFrame(update);
}

/* --- Testimonials Carousel --- */
function initCarousel(carouselEl) {
  if (!carouselEl) return;
  const inner = carouselEl.querySelector('.testimonials-inner');
  const slides = carouselEl.querySelectorAll('.testimonial-slide');
  const dots = carouselEl.querySelectorAll('.carousel-dot');
  const prevBtn = carouselEl.querySelector('.carousel-btn.prev');
  const nextBtn = carouselEl.querySelector('.carousel-btn.next');
  let current = 0;
  let autoplay;

  function go(idx) {
    current = (idx + slides.length) % slides.length;
    if (inner) inner.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  prevBtn?.addEventListener('click', () => { go(current - 1); resetAuto(); });
  nextBtn?.addEventListener('click', () => { go(current + 1); resetAuto(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { go(i); resetAuto(); }));

  function resetAuto() {
    clearInterval(autoplay);
    autoplay = setInterval(() => go(current + 1), 5000);
  }
  autoplay = setInterval(() => go(current + 1), 5000);
  go(0);
}

document.querySelectorAll('.testimonials-carousel').forEach(initCarousel);

/* Exposed so home-cms.js can re-bind the carousel after it rebuilds the
   slides/dots from CMS data — the querySelectorAll snapshots above would
   otherwise still point at the original static markup. */
window.apexInitTestimonialCarousel = initCarousel;

/* --- FAQ Accordion --- */
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

/* --- Project Filter --- */
function initFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const filterItems = document.querySelectorAll('[data-filter]');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      filterItems.forEach(item => {
        const match = filter === 'all' || item.dataset.category === filter;
        item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        if (match) {
          item.style.opacity = '1';
          item.style.transform = 'scale(1)';
          item.style.display = '';
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.95)';
          setTimeout(() => { if (!match) item.style.display = 'none'; }, 300);
        }
      });
    });
  });
}
initFilter();

/* --- Newsletter Form --- */
document.querySelectorAll('.newsletter-form').forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('input');
    const btn = form.querySelector('button');
    if (input?.value) {
      btn.textContent = '✓ Subscribed!';
      btn.style.background = '#27ae60';
      input.value = '';
      setTimeout(() => {
        btn.textContent = 'Subscribe';
        btn.style.background = '';
      }, 3000);
    }
  });
});

/* --- Contact / Application Forms --- */
document.querySelectorAll('form.contact-form, form.apply-form').forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    btn.textContent = 'Sending...';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = '✓ Message Sent!';
      btn.style.background = '#27ae60';
      btn.style.borderColor = '#27ae60';
      setTimeout(() => {
        btn.textContent = orig;
        btn.style.background = '';
        btn.style.borderColor = '';
        btn.disabled = false;
        form.reset();
      }, 4000);
    }, 1500);
  });
});

/* --- Hero BG Parallax --- */
function parallaxHero() {
  const heroBg = document.querySelector('.hero-bg');
  if (!heroBg) return;
  const scroll = window.scrollY;
  heroBg.style.transform = `translateY(${scroll * 0.3}px)`;
}
window.addEventListener('scroll', parallaxHero, { passive: true });

/* --- Hero BG Image Load --- */
window.addEventListener('load', () => {
  document.querySelector('.hero-bg')?.classList.add('loaded');
});

/* --- Active nav highlighting ---
 * Normalises the page URL and each href to a bare slug (strips .html,
 * trailing slashes, query strings) so the match works regardless of
 * whether the host serves clean URLs (Netlify/Vercel/GitHub Pages/cPanel).
 *   local:   /about.html  → slug "about"
 *   hosted:  /about       → slug "about"   ← both match "about.html" href
 *   home:    / or /index  → slug "index"   ← matches "index.html" href
 */
function highlightNav() {
  const pathname = window.location.pathname;

  // Strip trailing slash, grab last segment, remove .html, lowercase
  const segment = pathname.replace(/\/$/, '').split('/').pop() || '';
  const currentSlug = segment.replace(/\.html$/i, '').toLowerCase() || 'index';

  // Both desktop (.nav-links a) and mobile (.nav-mobile a) links
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(link => {
    const raw = (link.getAttribute('href') || '').split('?')[0].split('#')[0];

    // Skip external links, bare anchors, and empty hrefs
    if (!raw || raw.startsWith('http') || raw.startsWith('//') || raw === '#') return;

    const hrefSlug = raw.split('/').pop().replace(/\.html$/i, '').toLowerCase() || 'index';

    if (hrefSlug === currentSlug) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}
highlightNav();

/* --- Leaflet Map Init (Projects / Contact) --- */
function initMap(containerId, lat, lng, zoom) {
  if (typeof L === 'undefined' || !document.getElementById(containerId)) return;
  const map = L.map(containerId, { zoomControl: true }).setView([lat, lng], zoom);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Custom gold marker
  const icon = L.divIcon({
    className: '',
    html: '<div style="width:16px;height:16px;background:#C9A84C;border:3px solid #0A1628;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
  L.marker([lat, lng], { icon }).addTo(map)
    .bindPopup('<b style="font-family:Georgia">APEX R&M GROUP</b><br>Kamonyi District, Runda Sector, Ruyenzi Cell, Nyagacaca Village, Presto Plazza.<br><a href="mailto:info.apexrmgroup@gmail.com" style="color:#1A6B8A">info.apexrmgroup@gmail.com</a>')
    .openPopup();

  return map;
}

// Init HQ map on contact page
if (document.getElementById('contact-map')) {
  initMap('contact-map', -1.962408, 29.982405, 13);
}

initProjectsMap();

/* --- Tooltip Init --- */
document.querySelectorAll('[data-tooltip]').forEach(el => {
  el.addEventListener('mouseenter', function () {
    const tip = document.createElement('div');
    tip.className = 'apex-tooltip';
    tip.textContent = this.dataset.tooltip;
    tip.style.cssText = `
      position:absolute; background:var(--navy); color:var(--gold);
      font-size:0.72rem; padding:0.3rem 0.7rem; border-radius:4px;
      white-space:nowrap; pointer-events:none; z-index:9999;
      font-family:var(--font-ui); letter-spacing:0.05em;
    `;
    document.body.appendChild(tip);
    const rect = this.getBoundingClientRect();
    tip.style.top = (rect.top - 36 + window.scrollY) + 'px';
    tip.style.left = (rect.left + rect.width / 2 - tip.offsetWidth / 2) + 'px';
    this._tooltip = tip;
  });
  el.addEventListener('mouseleave', function () {
    if (this._tooltip) { this._tooltip.remove(); this._tooltip = null; }
  });
});

/* Initial calls */
handleNavbar();
revealOnScroll();

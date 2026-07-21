/**
 * cms-loader.js — connects this static site to the Admin Portal CMS.
 *
 * Usage: <script src="js/cms-loader.js" data-api="https://admin.apexrmgroup.com" data-page="index"></script>
 *
 * Elements opt in to CMS control via attributes:
 *   data-cms="field_key"          -> sets textContent from /api/public/content
 *   data-cms-html="field_key"     -> sets innerHTML from /api/public/content (trusted admin-authored HTML)
 *   data-cms-img="field_key"      -> sets the src attribute of an <img> from /api/public/content
 *   data-cms-media="slot_key"     -> replaces children with a fixed image or auto-rotating slider
 *   data-cms-setting="key"        -> sets textContent from /api/public/settings
 *   data-cms-setting-href="key"   -> sets href from /api/public/settings (social links, favicon)
 *   data-cms-setting-mailto="key" -> sets href to "mailto:"+value (an <a> showing an email setting as its own text)
 *   data-cms-setting-tel="key"    -> sets href to "tel:"+value (an <a> showing a phone setting as its own text)
 *   data-cms-setting-src="key"    -> sets src from /api/public/settings (logo, favicon <img> fallback)
 *
 * If the API is unreachable, the page keeps whatever static content/markup already exists —
 * nothing is ever blanked out on failure.
 *
 * Performance:
 *   - localStorage stale-while-revalidate: CMS content applied synchronously from cache on every visit
 *   - Image preloading: on cached visits, <link rel="preload" as="image"> injected immediately so the
 *     browser starts downloading hero images before any API call completes
 *   - Preconnect: TCP/TLS handshake to admin API + Supabase CDN started at script parse time
 */
(function () {
  var currentScript = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  var API_BASE = (currentScript.getAttribute('data-api') || '').replace(/\/$/, '');
  var PAGE = currentScript.getAttribute('data-page') || '';

  if (!API_BASE || !PAGE) return;

  // ── Preconnect to admin API immediately ──────────────────────────────────────
  function addPreconnect(origin, crossOrigin) {
    if (document.querySelector('link[rel="preconnect"][href="' + origin + '"]')) return;
    var el = document.createElement('link');
    el.rel = 'preconnect';
    el.href = origin;
    if (crossOrigin) el.crossOrigin = 'anonymous';
    document.head.appendChild(el);
  }

  addPreconnect(API_BASE, false);

  var CACHE_KEY = 'apex_cms_' + PAGE;

  // ── Image preloading ─────────────────────────────────────────────────────────
  // Called with cached slot/settings data to kick off image downloads immediately,
  // before applyMediaSlots runs and before any API call completes.
  var _preconnectedHosts = {};
  function preloadImagesFromCache(slots, settings) {
    var urls = [];

    // Collect all image URLs from media slots
    if (slots) {
      Object.keys(slots).forEach(function (key) {
        var slot = slots[key];
        if (!slot || !slot.items) return;
        slot.items.forEach(function (item) { if (item.url) urls.push(item.url); });
      });
    }
    // Also preload the logo
    if (settings && settings.logo_url) urls.push(settings.logo_url);

    urls.forEach(function (url, idx) {
      try {
        // Preconnect to image CDN host (e.g. Supabase) — done once per host
        var host = new URL(url).origin;
        if (!_preconnectedHosts[host]) {
          addPreconnect(host, true);
          _preconnectedHosts[host] = true;
        }

        // Preload the image — browser starts downloading immediately
        if (document.querySelector('link[rel="preload"][href="' + url + '"]')) return;
        var pl = document.createElement('link');
        pl.rel = 'preload';
        pl.as = 'image';
        pl.href = url;
        // First image (hero) gets high fetch priority
        if (idx === 0) pl.setAttribute('fetchpriority', 'high');
        document.head.appendChild(pl);
      } catch (e) {}
    });
  }

  function safeFetchJson(url) {
    return fetch(url, { mode: 'cors' })
      .then(function (res) { return res.ok ? res.json() : null; })
      .catch(function () { return null; });
  }

  function applyContent(content) {
    if (!content) return;
    document.querySelectorAll('[data-cms]').forEach(function (el) {
      var key = el.getAttribute('data-cms');
      if (content[key] !== undefined && content[key] !== '') el.textContent = content[key];
    });
    document.querySelectorAll('[data-cms-html]').forEach(function (el) {
      var key = el.getAttribute('data-cms-html');
      if (content[key] !== undefined && content[key] !== '') el.innerHTML = content[key];
    });
    document.querySelectorAll('[data-cms-img]').forEach(function (el) {
      var key = el.getAttribute('data-cms-img');
      if (content[key]) el.setAttribute('src', content[key]);
    });
  }

  function applySettings(settings) {
    if (!settings) return;
    document.querySelectorAll('[data-cms-setting]').forEach(function (el) {
      var key = el.getAttribute('data-cms-setting');
      if (settings[key]) el.textContent = settings[key];
    });
    document.querySelectorAll('[data-cms-setting-href]').forEach(function (el) {
      var key = el.getAttribute('data-cms-setting-href');
      if (settings[key]) el.setAttribute('href', settings[key]);
    });
    document.querySelectorAll('[data-cms-setting-mailto]').forEach(function (el) {
      var key = el.getAttribute('data-cms-setting-mailto');
      if (settings[key]) el.setAttribute('href', 'mailto:' + settings[key]);
    });
    document.querySelectorAll('[data-cms-setting-tel]').forEach(function (el) {
      var key = el.getAttribute('data-cms-setting-tel');
      if (settings[key]) el.setAttribute('href', 'tel:' + settings[key].replace(/\s+/g, ''));
    });
    document.querySelectorAll('[data-cms-setting-src]').forEach(function (el) {
      var key = el.getAttribute('data-cms-setting-src');
      if (settings[key]) el.setAttribute('src', settings[key]);
    });
  }

  function buildSlider(container, items) {
    container.innerHTML = '';
    container.classList.add('cms-slider');
    var track = document.createElement('div');
    track.className = 'cms-slider-track';
    items.forEach(function (item, idx) {
      var img = document.createElement('img');
      img.src = item.url;
      img.alt = item.altText || '';
      img.className = 'cms-slider-img';
      img.style.opacity = idx === 0 ? '1' : '0';
      if (idx === 0) {
        img.loading = 'eager';
        img.setAttribute('fetchpriority', 'high');
      } else {
        img.loading = 'lazy';
      }
      track.appendChild(img);
    });
    container.appendChild(track);

    if (items.length <= 1) return;

    var current = 0;
    var imgs = track.querySelectorAll('.cms-slider-img');

    // Navigation: dots + prev/next buttons
    var navEl = document.createElement('div');
    navEl.className = 'cms-slider-nav';

    var prevBtn = document.createElement('button');
    prevBtn.className = 'slider-nav-btn';
    prevBtn.setAttribute('aria-label', 'Previous');
    prevBtn.innerHTML = '&#8249;';

    var dotsEl = document.createElement('div');
    dotsEl.className = 'slider-nav-dots';
    items.forEach(function(_, i) {
      var dot = document.createElement('button');
      dot.className = 'slider-nav-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Slide ' + (i + 1));
      dot.addEventListener('click', function() { goTo(i); });
      dotsEl.appendChild(dot);
    });

    var nextBtn = document.createElement('button');
    nextBtn.className = 'slider-nav-btn';
    nextBtn.setAttribute('aria-label', 'Next');
    nextBtn.innerHTML = '&#8250;';

    navEl.appendChild(prevBtn);
    navEl.appendChild(dotsEl);
    navEl.appendChild(nextBtn);
    container.appendChild(navEl);

    function updateDots() {
      dotsEl.querySelectorAll('.slider-nav-dot').forEach(function(d, i) {
        d.classList.toggle('active', i === current);
      });
    }

    var timer;
    function goTo(idx) {
      imgs[current].style.opacity = '0';
      current = ((idx % imgs.length) + imgs.length) % imgs.length;
      imgs[current].style.opacity = '1';
      updateDots();
      clearInterval(timer);
      timer = setInterval(function() { goTo(current + 1); }, 7000);
    }

    prevBtn.addEventListener('click', function() { goTo(current - 1); });
    nextBtn.addEventListener('click', function() { goTo(current + 1); });

    timer = setInterval(function() { goTo(current + 1); }, 7000);
  }

  function applyMediaSlots(slots) {
    if (!slots) return;
    document.querySelectorAll('[data-cms-media]').forEach(function (el) {
      var key = el.getAttribute('data-cms-media');
      var slot = slots[key];
      if (!slot || !slot.items || slot.items.length === 0) return;

      if (slot.mode === 'SLIDER' && slot.items.length > 1) {
        buildSlider(el, slot.items);
      } else {
        var existingImg = el.querySelector('img');
        if (existingImg) {
          existingImg.src = slot.items[0].url;
          existingImg.setAttribute('fetchpriority', 'high');
          if (slot.items[0].altText) existingImg.alt = slot.items[0].altText;
        } else if (el.style && 'backgroundImage' in el.style) {
          el.style.backgroundImage = "url('" + slot.items[0].url + "')";
        }
      }
    });
  }

  // ── Social links — dynamic image icons in footer ────────────────────────────
  var SOCIAL_CACHE_KEY = 'apex_social_links';

  function renderSocialLinks(links) {
    var container = document.getElementById('footer-social');
    if (!container || !links || !links.length) return;
    container.innerHTML = links.map(function (l) {
      var icon = l.iconUrl
        ? '<img src="' + l.iconUrl + '" alt="' + l.name + '" style="width:18px;height:18px;object-fit:contain;display:block;">'
        : '<span style="font-size:0.7rem;opacity:0.6;">' + l.name.charAt(0) + '</span>';
      return '<a href="' + l.url + '" class="social-icon" aria-label="' + l.name + '" target="_blank" rel="noopener noreferrer">' + icon + '</a>';
    }).join('');
  }

  // Apply cached social links immediately (instant on repeat visits)
  try {
    var rawSocial = localStorage.getItem(SOCIAL_CACHE_KEY);
    if (rawSocial) renderSocialLinks(JSON.parse(rawSocial));
  } catch (e) {}

  // ── Stale-while-revalidate cache ────────────────────────────────────────────
  // 1. Read last-known data from localStorage synchronously
  // 2. Preload images BEFORE applying slots — browser starts the download immediately
  // 3. Apply CMS data so content is visible instantly (no API wait on repeat visits)
  // 4. Fetch fresh data from API in the background and update cache for next visit
  try {
    var raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      var cached = JSON.parse(raw);
      if (cached) {
        // Kick off image downloads FIRST — gives browser maximum head start
        preloadImagesFromCache(cached.slots, cached.settings);
        applyContent(cached.content);
        applyMediaSlots(cached.slots);
        applySettings(cached.settings);
      }
    }
  } catch (e) { /* localStorage unavailable or corrupt — ignore */ }

  function trackPageView() {
    try {
      fetch(API_BASE + '/api/public/track', {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: PAGE, referrer: document.referrer || '' }),
      }).catch(function () {});
    } catch (e) { /* never block the page on analytics */ }
  }

  function init() {
    Promise.all([
      safeFetchJson(API_BASE + '/api/public/content?page=' + encodeURIComponent(PAGE)),
      safeFetchJson(API_BASE + '/api/public/media-slots?page=' + encodeURIComponent(PAGE)),
      safeFetchJson(API_BASE + '/api/public/settings'),
      safeFetchJson(API_BASE + '/api/public/social-links'),
    ]).then(function (results) {
      var content     = results[0] && results[0].content;
      var slots       = results[1] && results[1].slots;
      var settings    = results[2] && results[2].settings;
      var socialLinks = results[3] && results[3].links;

      // Preload fresh images (handles first visit and any updated images)
      preloadImagesFromCache(slots, settings);

      applyContent(content);
      applyMediaSlots(slots);
      applySettings(settings);
      renderSocialLinks(socialLinks);

      // Persist for instant display on the next page load
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          content:  content  || null,
          slots:    slots    || null,
          settings: settings || null,
        }));
        if (socialLinks) localStorage.setItem(SOCIAL_CACHE_KEY, JSON.stringify(socialLinks));
      } catch (e) { /* storage quota exceeded or private mode — ignore */ }
    });
    trackPageView();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

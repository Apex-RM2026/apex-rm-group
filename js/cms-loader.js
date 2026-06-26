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
 */
(function () {
  var currentScript = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  var API_BASE = (currentScript.getAttribute('data-api') || '').replace(/\/$/, '');
  var PAGE = currentScript.getAttribute('data-page') || '';

  if (!API_BASE || !PAGE) return;

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
      track.appendChild(img);
    });
    container.appendChild(track);

    if (items.length <= 1) return;
    var current = 0;
    var imgs = track.querySelectorAll('.cms-slider-img');
    setInterval(function () {
      imgs[current].style.opacity = '0';
      current = (current + 1) % imgs.length;
      imgs[current].style.opacity = '1';
    }, 7000);
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
          if (slot.items[0].altText) existingImg.alt = slot.items[0].altText;
        } else if (el.style && 'backgroundImage' in el.style) {
          el.style.backgroundImage = "url('" + slot.items[0].url + "')";
        }
      }
    });
  }

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
    ]).then(function (results) {
      applyContent(results[0] && results[0].content);
      applyMediaSlots(results[1] && results[1].slots);
      applySettings(results[2] && results[2].settings);
    });
    trackPageView();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

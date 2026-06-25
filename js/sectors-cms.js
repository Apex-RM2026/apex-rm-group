/* ════════════════════════════════════════════════════════════════
   SECTORS PAGE — fully dynamic sector list (Admin Portal can add,
   remove, reorder, and open/close any sector, not just the original
   8). Renders the overview grid cards AND the detail sections itself
   (rather than relying on the generic cms-loader.js for images),
   since this list can grow/shrink and each photo slot is keyed by a
   sector's own id. Falls back to the existing static markup — the
   original 8 sectors — if the API is unreachable.
   ════════════════════════════════════════════════════════════════ */
(function () {
  var LEGACY_KEYS = ['government', 'agriculture', 'mining', 'urban', 'energy', 'conservation', 'humanitarian', 'finance'];

  function getApiBase() {
    var loaderScript = document.querySelector('script[src*="cms-loader.js"]');
    return loaderScript ? (loaderScript.getAttribute('data-api') || '').replace(/\/$/, '') : '';
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el && value) el.textContent = value;
  }

  // Builds the items list from either the new unified field, or — if an
  // admin hasn't opened/saved the new Sectors tab yet — the original 8
  // separately-keyed fields, so nothing regresses during the transition.
  function buildItems(content) {
    if (content.sector_items) {
      try {
        var parsed = JSON.parse(content.sector_items);
        if (Array.isArray(parsed.items)) return parsed.items;
      } catch (e) { /* fall through to legacy */ }
    }

    var overviewIcons = {};
    if (content.overview) {
      try {
        var overview = JSON.parse(content.overview);
        (overview.cards || []).forEach(function (c) { overviewIcons[c.anchor] = c.icon; });
      } catch (e) { /* ignore */ }
    }

    var legacyItems = [];
    LEGACY_KEYS.forEach(function (key) {
      var fieldKey = 'sector_' + key;
      if (!content[fieldKey]) return;
      try {
        var sec = JSON.parse(content[fieldKey]);
        sec.key = sec.key || key;
        sec.anchor = sec.key;
        sec.icon = overviewIcons[sec.key] || '✨';
        sec.status = sec.status || 'OPEN';
        legacyItems.push(sec);
      } catch (e) { /* skip malformed entry */ }
    });
    return legacyItems;
  }

  function mediaHtml(slot) {
    if (!slot || !slot.items || !slot.items.length) return '';
    if (slot.mode === 'SLIDER' && slot.items.length > 1) {
      return (
        '<div class="cms-slider" style="position:relative; width:100%; aspect-ratio:4/3; border-radius:var(--radius-lg); box-shadow:var(--shadow-lg); overflow:hidden;">' +
          '<div class="cms-slider-track">' +
            slot.items.map(function (item, idx) {
              return '<img class="cms-slider-img" src="' + escapeHtml(item.url) + '" alt="' + escapeHtml(item.altText || '') + '" style="opacity:' + (idx === 0 ? 1 : 0) + ';">';
            }).join('') +
          '</div>' +
        '</div>'
      );
    }
    return '<img src="' + escapeHtml(slot.items[0].url) + '" alt="" style="width:100%; object-fit:cover; display:block;">';
  }

  function startSliders(container) {
    container.querySelectorAll('.cms-slider').forEach(function (slider) {
      var imgs = slider.querySelectorAll('.cms-slider-img');
      if (imgs.length <= 1) return;
      var current = 0;
      setInterval(function () {
        imgs[current].style.opacity = '0';
        current = (current + 1) % imgs.length;
        imgs[current].style.opacity = '1';
      }, 7000);
    });
  }

  function renderOverviewCards(items) {
    var grid = document.getElementById('overview-grid');
    if (!grid) return;
    if (!items.length) { grid.innerHTML = ''; return; }
    grid.innerHTML = items.map(function (item, idx) {
      return (
        '<a href="#' + escapeHtml(item.anchor) + '" class="sector-card reveal" data-delay="' + ((idx % 4) * 50 + 100) + '" style="text-decoration:none;">' +
          '<div class="sector-icon">' + escapeHtml(item.icon) + '</div><h3>' + escapeHtml(item.title) + '</h3><p>' + escapeHtml(item.description) + '</p>' +
        '</a>'
      );
    }).join('');
  }

  function renderDetailSections(items, mediaSlots) {
    var container = document.getElementById('sectors-detail-list');
    if (!container) return;
    if (!items.length) { container.innerHTML = ''; return; }

    container.innerHTML = items.map(function (item, idx) {
      var useCases = (item.useCases || []).map(function (u) {
        return '<div class="use-case"><i class="fa-solid fa-diamond"></i> ' + escapeHtml(u.text) + '</div>';
      }).join('');
      var slot = mediaSlots['sector_' + item.key + '_image'];
      var photo = mediaHtml(slot);

      var content = (
        '<div class="sector-content reveal-left">' +
          '<span class="section-label">Sector ' + String(idx + 1).padStart(2, '0') + '</span>' +
          '<h2 class="section-title">' + escapeHtml(item.title) + '</h2>' +
          '<div class="gold-line"></div>' +
          '<p>' + escapeHtml(item.description) + '</p>' +
          (useCases ? '<div class="use-cases">' + useCases + '</div>' : '') +
          '<a href="contact.html" class="btn-dark"><i class="fa-solid fa-paper-plane"></i> Discuss Your Project</a>' +
        '</div>'
      );
      var img = '<div class="sector-img reveal-right">' + photo + '</div>';

      return (
        '<section class="sector-detail" id="' + escapeHtml(item.anchor) + '">' +
          '<div class="container">' +
            '<div class="sector-detail-grid' + (idx % 2 === 1 ? ' reverse' : '') + '">' +
              (idx % 2 === 1 ? content + img : img + content) +
            '</div>' +
          '</div>' +
        '</section>'
      );
    }).join('');

    startSliders(container);
  }

  function renderContent(content, mediaSlots) {
    if (!content) return;

    var allItems = buildItems(content);
    var visibleItems = allItems.filter(function (i) { return (i.status || 'OPEN') !== 'CLOSED'; });

    if (content.overview) {
      try {
        var overview = JSON.parse(content.overview);
        setText('overview-label', overview.sectionLabel);
        setText('overview-title', overview.title);
      } catch (e) { /* keep static fallback markup */ }
    }
    renderOverviewCards(visibleItems);
    renderDetailSections(visibleItems, mediaSlots || {});

    if (content.cta) {
      try {
        var cta = JSON.parse(content.cta);
        setText('sectors-cta-heading', cta.heading);
        setText('sectors-cta-emphasis', cta.emphasis);
        setText('sectors-cta-paragraph', cta.paragraph);
      } catch (e) { /* keep static fallback markup */ }
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var apiBase = getApiBase();
    if (!apiBase) return;

    Promise.all([
      fetch(apiBase + '/api/public/content?page=sectors', { mode: 'cors' }).then(function (res) { return res.ok ? res.json() : null; }).catch(function () { return null; }),
      fetch(apiBase + '/api/public/media-slots?page=sectors', { mode: 'cors' }).then(function (res) { return res.ok ? res.json() : null; }).catch(function () { return null; }),
    ]).then(function (results) {
      renderContent(results[0] && results[0].content, results[1] && results[1].slots);
    });
  });
})();

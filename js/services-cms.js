/* ════════════════════════════════════════════════════════════════
   SERVICES PAGE — fully dynamic service list (Admin Portal can add,
   remove, reorder, and open/close any service, not just the original
   7). Renders the overview grid cards AND the detail sections itself
   (rather than relying on the generic cms-loader.js for images),
   since this list can grow/shrink and each photo slot is keyed by a
   service's own id. Falls back to the existing static markup — the
   original 7 services — if the API is unreachable.
   ════════════════════════════════════════════════════════════════ */
(function () {
  var LEGACY_KEYS = ['data_collection', 'gis', 'remote_sensing', 'land_admin', 'environment', 'infrastructure', 'capacity'];

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
  // admin hasn't opened/saved the new Services tab yet — the original 7
  // separately-keyed fields, so nothing regresses during the transition.
  function buildItems(content) {
    if (content.service_items) {
      try {
        var parsed = JSON.parse(content.service_items);
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
      var fieldKey = 'service_' + key;
      if (!content[fieldKey]) return;
      try {
        var svc = JSON.parse(content[fieldKey]);
        svc.icon = overviewIcons[svc.anchor] || '✨';
        svc.status = svc.status || 'OPEN';
        legacyItems.push(svc);
      } catch (e) { /* skip malformed entry */ }
    });
    return legacyItems;
  }

  function mediaHtml(slot) {
    if (!slot || !slot.items || !slot.items.length) return '';
    if (slot.mode === 'SLIDER' && slot.items.length > 1) {
      return (
        '<div class="cms-slider" style="position:relative; width:100%; height:100%;">' +
          '<div class="cms-slider-track">' +
            slot.items.map(function (item, idx) {
              return '<img class="cms-slider-img" src="' + escapeHtml(item.url) + '" alt="' + escapeHtml(item.altText || '') + '" style="opacity:' + (idx === 0 ? 1 : 0) + ';">';
            }).join('') +
          '</div>' +
        '</div>'
      );
    }
    return '<img src="' + escapeHtml(slot.items[0].url) + '" alt="" style="width:100%; height:100%; object-fit:cover; display:block;">';
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
    if (!grid || !items.length) return;
    grid.innerHTML = items.map(function (item, idx) {
      return (
        '<a href="#' + escapeHtml(item.anchor) + '" class="service-card reveal" data-delay="' + ((idx % 3) * 100 + 100) + '" style="text-decoration:none;">' +
          '<div class="service-icon">' + escapeHtml(item.icon) + '</div><div class="service-num">' + String(idx + 1).padStart(2, '0') + '</div>' +
          '<h3>' + escapeHtml(item.title) + '</h3><p>' + escapeHtml(item.description) + '</p>' +
        '</a>'
      );
    }).join('');
  }

  function renderDetailSections(items, mediaSlots) {
    var container = document.getElementById('services-detail-list');
    if (!container || !items.length) return;

    container.innerHTML = items.map(function (item, idx) {
      var deliverables = (item.deliverables || []).map(function (d) {
        return '<div class="deliverable-item"><i class="fa-solid fa-diamond"></i> ' + escapeHtml(d.text) + '</div>';
      }).join('');
      var industries = (item.industries || []).map(function (i) {
        return '<span class="industry-tag">' + escapeHtml(i.text) + '</span>';
      }).join('');
      var slot = mediaSlots['service_' + item.key + '_image'];
      var photo = mediaHtml(slot);

      var content = (
        '<div class="service-detail-content reveal-left">' +
          '<span class="section-label">Service ' + String(idx + 1).padStart(2, '0') + '</span>' +
          '<h2 class="section-title">' + escapeHtml(item.title) + '</h2>' +
          '<div class="gold-line"></div>' +
          '<p>' + escapeHtml(item.description) + '</p>' +
          (deliverables ? (
            '<h4 style="font-family:var(--font-ui);font-size:0.72rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--gold);margin:1.5rem 0 0.8rem;">Key Deliverables</h4>' +
            '<div class="deliverables-list">' + deliverables + '</div>'
          ) : '') +
          (industries ? (
            '<h4 style="font-family:var(--font-ui);font-size:0.72rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--navy);margin-bottom:0.6rem;">Industries Served</h4>' +
            '<div class="industries-served">' + industries + '</div>'
          ) : '') +
          '<a href="contact.html" class="btn-primary"><i class="fa-solid fa-paper-plane"></i> Request This Service</a>' +
        '</div>'
      );
      var img = '<div class="service-detail-img reveal-right">' + photo + '</div>';

      return (
        '<section class="service-detail" id="' + escapeHtml(item.anchor) + '">' +
          '<div class="container">' +
            '<div class="service-detail-grid' + (idx % 2 === 1 ? ' reverse' : '') + '">' +
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
        setText('services-cta-label', cta.label);
        setText('services-cta-title', cta.title);
        setText('services-cta-paragraph', cta.paragraph);
      } catch (e) { /* keep static fallback markup */ }
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var apiBase = getApiBase();
    if (!apiBase) return;

    Promise.all([
      fetch(apiBase + '/api/public/content?page=services', { mode: 'cors' }).then(function (res) { return res.ok ? res.json() : null; }).catch(function () { return null; }),
      fetch(apiBase + '/api/public/media-slots?page=services', { mode: 'cors' }).then(function (res) { return res.ok ? res.json() : null; }).catch(function () { return null; }),
    ]).then(function (results) {
      renderContent(results[0] && results[0].content, results[1] && results[1].slots);
    });
  });
})();

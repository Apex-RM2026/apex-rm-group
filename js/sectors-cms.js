/* ════════════════════════════════════════════════════════════════
   SECTORS PAGE — renders the Admin Portal-managed sections that the
   generic cms-loader.js can't handle on its own: the overview grid
   and the eight sector detail sections (use-cases lists are
   repeatable JSON blobs; images are handled generically by
   cms-loader.js via data-cms-media).
   Fails silently to the static fallback markup if the API is unreachable.
   ════════════════════════════════════════════════════════════════ */
(function () {
  var SECTOR_KEYS = ['government', 'agriculture', 'mining', 'urban', 'energy', 'conservation', 'humanitarian', 'finance'];

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

  function renderOverviewCards(cards) {
    var grid = document.getElementById('overview-grid');
    if (!grid || !cards || !cards.length) return;
    grid.innerHTML = cards.map(function (c, idx) {
      return (
        '<a href="#' + escapeHtml(c.anchor) + '" class="sector-card reveal" data-delay="' + ((idx % 4) * 50 + 100) + '" style="text-decoration:none;">' +
          '<div class="sector-icon">' + escapeHtml(c.icon) + '</div><h3>' + escapeHtml(c.title) + '</h3><p>' + escapeHtml(c.description) + '</p>' +
        '</a>'
      );
    }).join('');
  }

  function renderUseCases(key, useCases) {
    var container = document.getElementById('sec-' + key + '-usecases');
    if (!container || !useCases || !useCases.length) return;
    container.innerHTML = useCases.map(function (u) {
      return '<div class="use-case"><i class="fa-solid fa-diamond"></i> ' + escapeHtml(u.text) + '</div>';
    }).join('');
  }

  function renderContent(content) {
    if (!content) return;

    if (content.overview) {
      try {
        var overview = JSON.parse(content.overview);
        setText('overview-label', overview.sectionLabel);
        setText('overview-title', overview.title);
        renderOverviewCards(overview.cards);
      } catch (e) { /* keep static fallback markup */ }
    }

    SECTOR_KEYS.forEach(function (key) {
      var fieldKey = 'sector_' + key;
      if (!content[fieldKey]) return;
      try {
        var sec = JSON.parse(content[fieldKey]);
        setText('sec-' + key + '-label', sec.label);
        setText('sec-' + key + '-title', sec.title);
        setText('sec-' + key + '-description', sec.description);
        renderUseCases(key, sec.useCases);
      } catch (e) { /* keep static fallback markup */ }
    });

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

    fetch(apiBase + '/api/public/content?page=sectors', { mode: 'cors' })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) { renderContent(data && data.content); })
      .catch(function () { /* keep static fallback markup */ });
  });
})();

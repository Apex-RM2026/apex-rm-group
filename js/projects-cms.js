/* ════════════════════════════════════════════════════════════════
   PROJECTS PAGE — renders the Admin Portal-managed sections that the
   generic cms-loader.js can't handle on its own: the impact stats row
   and the portfolio's project case-study cards (both repeatable JSON
   blobs). Images are handled generically by cms-loader.js via
   data-cms-media, except each project card's own photo, which is
   stored inline with the card data (cards can be freely added/removed,
   so each needs its own image rather than a fixed media slot).
   Fails silently to the static fallback markup if the API is unreachable.
   ════════════════════════════════════════════════════════════════ */
(function () {
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

  function renderImpactStats(items) {
    var row = document.getElementById('impact-stats-row');
    if (!row || !items || !items.length) return;
    row.innerHTML = items.map(function (item, idx) {
      return (
        '<div class="impact-box reveal" data-delay="' + (idx * 100) + '">' +
          '<div class="impact-num"><span data-count="' + escapeHtml(item.value) + '">0</span>' + escapeHtml(item.suffix) + '</div>' +
          '<div class="impact-label">' + escapeHtml(item.label) + '</div>' +
        '</div>'
      );
    }).join('');
  }

  function renderProjectCards(cards) {
    var grid = document.getElementById('portfolio-grid');
    if (!grid || !cards || !cards.length) return;
    grid.innerHTML = cards.map(function (card, idx) {
      var metaItems = [
        card.client ? '<div class="case-meta-item"><i class="fa-solid fa-building-columns"></i> ' + escapeHtml(card.client) + '</div>' : '',
        card.duration ? '<div class="case-meta-item"><i class="fa-solid fa-clock"></i> ' + escapeHtml(card.duration) + '</div>' : '',
        card.scope ? '<div class="case-meta-item"><i class="fa-solid fa-map"></i> ' + escapeHtml(card.scope) + '</div>' : '',
      ].join('');
      return (
        '<div class="project-full-card reveal" data-delay="' + ((idx % 3) * 100 + 100) + '">' +
          '<div class="project-image">' +
            (card.image ? '<img src="' + escapeHtml(card.image) + '" alt="' + escapeHtml(card.title) + '" loading="lazy">' : '') +
            '<div class="project-tag">' + escapeHtml(card.tag) + '</div>' +
          '</div>' +
          '<div class="project-body">' +
            '<div class="project-meta"><span>' + escapeHtml(card.country) + '</span> &bull; <span>' + escapeHtml(card.year) + '</span></div>' +
            '<h3>' + escapeHtml(card.title) + '</h3>' +
            '<div class="case-study-meta">' + metaItems + '</div>' +
            '<p>' + escapeHtml(card.description) + '</p>' +
            (card.impact ? (
              '<div style="margin-top:1rem; padding-top:1rem; border-top:1px solid rgba(10,22,40,0.08);">' +
                '<div style="font-family:var(--font-ui);font-size:0.68rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--gold);margin-bottom:0.6rem;">Impact</div>' +
                '<p style="font-size:0.82rem;color:var(--gray);">' + escapeHtml(card.impact) + '</p>' +
              '</div>'
            ) : '') +
          '</div>' +
        '</div>'
      );
    }).join('');
  }

  function renderContent(content) {
    if (!content) return;

    if (content.impact_stats) {
      try {
        var stats = JSON.parse(content.impact_stats);
        renderImpactStats(stats.items);
      } catch (e) { /* keep static fallback markup */ }
    }

    if (content.portfolio) {
      try {
        var portfolio = JSON.parse(content.portfolio);
        setText('portfolio-label', portfolio.sectionLabel);
        setText('portfolio-title', portfolio.title);
        setText('portfolio-subtitle', portfolio.subtitle);
        renderProjectCards(portfolio.cards);
      } catch (e) { /* keep static fallback markup */ }
    }

    if (content.cta) {
      try {
        var cta = JSON.parse(content.cta);
        setText('projects-cta-heading', cta.heading);
        setText('projects-cta-emphasis', cta.emphasis);
        setText('projects-cta-paragraph', cta.paragraph);
      } catch (e) { /* keep static fallback markup */ }
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var apiBase = getApiBase();
    if (!apiBase) return;

    fetch(apiBase + '/api/public/content?page=projects', { mode: 'cors' })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) { renderContent(data && data.content); })
      .catch(function () { /* keep static fallback markup */ });
  });
})();

/* ════════════════════════════════════════════════════════════════
   HOME PAGE — renders the Admin Portal-managed sections that the
   generic cms-loader.js can't handle on its own (repeatable card
   lists stored as JSON blobs: services overview, why-choose-us
   points, client logos, and the insights preview cards).
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

  function setHtml(id, value) {
    var el = document.getElementById(id);
    if (el && value) el.innerHTML = value;
  }

  function renderServiceCards(cards) {
    var grid = document.getElementById('services-overview-grid');
    if (!grid || !cards || !cards.length) return;
    grid.innerHTML = cards.map(function (c, idx) {
      return (
        '<div class="service-card reveal" data-delay="' + ((idx % 3) * 100 + 100) + '">' +
          '<div class="service-icon">' + escapeHtml(c.icon) + '</div>' +
          '<div class="service-num">' + String(idx + 1).padStart(2, '0') + '</div>' +
          '<h3>' + escapeHtml(c.title) + '</h3>' +
          '<p>' + escapeHtml(c.description) + '</p>' +
          (c.link ? '<a href="' + escapeHtml(c.link) + '" class="service-link">Learn More <i class="fa-solid fa-arrow-right"></i></a>' : '') +
        '</div>'
      );
    }).join('');
  }

  function renderWhyPoints(points) {
    var grid = document.getElementById('why-points-grid');
    if (!grid || !points || !points.length) return;
    grid.innerHTML = points.map(function (p) {
      return (
        '<div class="why-point">' +
          '<div class="why-point-icon"><i class="' + escapeHtml(p.icon) + '"></i></div>' +
          '<div>' +
            '<h4>' + escapeHtml(p.title) + '</h4>' +
            '<p>' + escapeHtml(p.description) + '</p>' +
          '</div>' +
        '</div>'
      );
    }).join('');
  }

  function renderClientLogos(items) {
    var grid = document.getElementById('client-logos-grid');
    if (!grid || !items || !items.length) return;
    grid.innerHTML = items.map(function (item) {
      return '<div class="client-logo-item">' + escapeHtml(item.name) + '</div>';
    }).join('');
  }

  function renderInsightCards(posts) {
    var grid = document.getElementById('insights-preview-grid');
    if (!grid || !posts || !posts.length) return;
    grid.innerHTML = posts.map(function (post, idx) {
      return (
        '<div class="blog-card reveal" data-delay="' + ((idx % 3) * 100 + 100) + '">' +
          '<div class="blog-image">' +
            (post.image ? '<img src="' + escapeHtml(post.image) + '" alt="' + escapeHtml(post.title) + '" loading="lazy">' : '') +
          '</div>' +
          '<div class="blog-body">' +
            '<span class="blog-category">' + escapeHtml(post.category) + '</span>' +
            '<div class="blog-date">' + escapeHtml(post.date) + '</div>' +
            '<h3>' + escapeHtml(post.title) + '</h3>' +
            '<p>' + escapeHtml(post.description) + '</p>' +
            '<a href="insights.html" class="blog-read-more">Read More <i class="fa-solid fa-arrow-right"></i></a>' +
          '</div>' +
        '</div>'
      );
    }).join('');
  }

  function renderContent(content) {
    if (!content) return;

    if (content.services_overview) {
      try {
        var services = JSON.parse(content.services_overview);
        setText('services-overview-label', services.sectionLabel);
        setText('services-overview-title', services.title);
        setText('services-overview-subtitle', services.subtitle);
        renderServiceCards(services.cards);
      } catch (e) { /* keep static fallback markup */ }
    }

    if (content.why_choose) {
      try {
        var why = JSON.parse(content.why_choose);
        setText('why-choose-label', why.sectionLabel);
        setHtml('why-choose-title', why.title);
        setText('why-choose-subtitle', why.subtitle);
        renderWhyPoints(why.points);
      } catch (e) { /* keep static fallback markup */ }
    }

    if (content.client_logos) {
      try {
        var logos = JSON.parse(content.client_logos);
        setText('client-logos-label', logos.label);
        renderClientLogos(logos.items);
      } catch (e) { /* keep static fallback markup */ }
    }

    if (content.insights_preview) {
      try {
        var insights = JSON.parse(content.insights_preview);
        setText('insights-preview-label', insights.sectionLabel);
        setText('insights-preview-title', insights.title);
        setText('insights-preview-subtitle', insights.subtitle);
        renderInsightCards(insights.posts);
      } catch (e) { /* keep static fallback markup */ }
    }

    if (content.cta) {
      try {
        var cta = JSON.parse(content.cta);
        setText('cta-heading', cta.heading);
        setText('cta-emphasis', cta.emphasis);
        setText('cta-paragraph', cta.paragraph);
        setText('cta-button1-text', cta.button1Text);
        setText('cta-button2-text', cta.button2Text);
      } catch (e) { /* keep static fallback markup */ }
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var apiBase = getApiBase();
    if (!apiBase) return;

    fetch(apiBase + '/api/public/content?page=index', { mode: 'cors' })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) { renderContent(data && data.content); })
      .catch(function () { /* keep static fallback markup */ });
  });
})();

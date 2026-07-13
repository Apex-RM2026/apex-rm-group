/* ════════════════════════════════════════════════════════════════
   ABOUT PAGE — renders the Admin Portal-managed sections that the
   generic cms-loader.js can't handle on its own (repeatable card
   lists stored as JSON blobs: core values, approach steps,
   milestones timeline, and commitment stats).
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

  function iconHtml(icon) {
    if (!icon) return '';
    if (icon.indexOf('http') === 0 || icon.indexOf('//') === 0) {
      return '<img src="' + escapeHtml(icon) + '" alt="" loading="lazy">';
    }
    return escapeHtml(icon);
  }

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el && value) el.textContent = value;
  }

  function renderValueCards(cards) {
    var grid = document.getElementById('core-values-grid');
    if (!grid || !cards || !cards.length) return;
    grid.innerHTML = cards.map(function (c, idx) {
      return (
        '<div class="value-card reveal" data-delay="' + ((idx % 3) * 100 + 100) + '">' +
          '<div class="value-icon">' + iconHtml(c.icon) + '</div>' +
          '<h3>' + escapeHtml(c.title) + '</h3>' +
          '<p>' + escapeHtml(c.description) + '</p>' +
        '</div>'
      );
    }).join('');
  }

  function renderApproachSteps(steps) {
    var container = document.getElementById('approach-steps');
    if (!container || !steps || !steps.length) return;
    container.innerHTML = steps.map(function (s, idx) {
      return (
        '<div class="process-step">' +
          '<div class="step-num">' + (idx + 1) + '</div>' +
          '<h4>' + escapeHtml(s.title) + '</h4>' +
          '<p>' + escapeHtml(s.description) + '</p>' +
        '</div>'
      );
    }).join('');
  }

  function renderMilestones(items) {
    var container = document.getElementById('milestones-timeline');
    if (!container || !items || !items.length) return;
    container.innerHTML = items.map(function (m, idx) {
      var card = (
        '<div class="tl-card ' + (idx % 2 === 0 ? 'tl-card-left' : 'tl-card-right') + '">' +
          '<span class="tl-year">' + escapeHtml(m.quarter) + '</span>' +
          '<h4>' + escapeHtml(m.title) + '</h4>' +
          '<p>' + escapeHtml(m.description) + '</p>' +
        '</div>'
      );
      var dot = '<div class="tl-dot-col"><div class="tl-dot">◆</div></div>';
      var empty = '<div class="tl-empty"></div>';
      return (
        '<div class="tl-row">' +
          (idx % 2 === 0 ? card + dot + empty : empty + dot + card) +
        '</div>'
      );
    }).join('');
  }

  function renderCommitmentStats(stats) {
    var container = document.getElementById('commitment-stats');
    if (!container || !stats || !stats.length) return;
    container.innerHTML = stats.map(function (s) {
      return (
        '<div style="text-align:center;color:rgba(255,255,255,0.8);">' +
          '<div style="font-size:2rem;color:var(--gold);font-family:var(--font-heading);font-weight:700;">' + escapeHtml(s.value) + '</div>' +
          '<div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;margin-top:0.3rem;">' + escapeHtml(s.label) + '</div>' +
        '</div>'
      );
    }).join('');
  }

  function renderContent(content) {
    if (!content) return;

    if (content.our_story) {
      try {
        var story = JSON.parse(content.our_story);
        setText('our-story-label', story.label);
        setText('our-story-title', story.title);
        setText('our-story-paragraph1', story.paragraph1);
        setText('our-story-paragraph2', story.paragraph2);
        setText('our-story-paragraph3', story.paragraph3);
      } catch (e) { /* keep static fallback markup */ }
    }

    if (content.mission) {
      try {
        var mission = JSON.parse(content.mission);
        setText('mission-label', mission.label);
        setText('mission-title', mission.title);
        setText('mission-statement', mission.statement);
      } catch (e) { /* keep static fallback markup */ }
    }

    if (content.vision) {
      try {
        var vision = JSON.parse(content.vision);
        setText('vision-label', vision.label);
        setText('vision-title', vision.title);
        setText('vision-statement', vision.statement);
      } catch (e) { /* keep static fallback markup */ }
    }

    if (content.core_values) {
      try {
        var values = JSON.parse(content.core_values);
        setText('core-values-label', values.sectionLabel);
        setText('core-values-title', values.title);
        setText('core-values-subtitle', values.subtitle);
        renderValueCards(values.cards);
      } catch (e) { /* keep static fallback markup */ }
    }

    if (content.approach) {
      try {
        var approach = JSON.parse(content.approach);
        setText('approach-label', approach.sectionLabel);
        setText('approach-title', approach.title);
        setText('approach-subtitle', approach.subtitle);
        renderApproachSteps(approach.steps);
      } catch (e) { /* keep static fallback markup */ }
    }

    if (content.milestones) {
      try {
        var milestones = JSON.parse(content.milestones);
        setText('milestones-label', milestones.sectionLabel);
        setText('milestones-title', milestones.title);
        setText('milestones-subtitle', milestones.subtitle);
        renderMilestones(milestones.items);
      } catch (e) { /* keep static fallback markup */ }
    }

    if (content.commitment) {
      try {
        var commitment = JSON.parse(content.commitment);
        setText('commitment-label', commitment.label);
        setText('commitment-title', commitment.title);
        setText('commitment-paragraph', commitment.paragraph);
        renderCommitmentStats(commitment.stats);
      } catch (e) { /* keep static fallback markup */ }
    }

    if (content.about_cta) {
      try {
        var cta = JSON.parse(content.about_cta);
        setText('about-cta-heading', cta.heading);
        setText('about-cta-emphasis', cta.emphasis);
      } catch (e) { /* keep static fallback markup */ }
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var apiBase = getApiBase();
    if (!apiBase) return;

    fetch(apiBase + '/api/public/content?page=about', { mode: 'cors' })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) { renderContent(data && data.content); })
      .catch(function () { /* keep static fallback markup */ });
  });
})();

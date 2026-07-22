/* ════════════════════════════════════════════════════════════════
   CAREERS — dynamic job listings (All / Internal / External tabs)
   Pulls open vacancies from the Admin Portal. Apply Now always links
   out to the admin-configured URL (or a mailto fallback) and reports
   the click back to the portal for tracking. Supports deep-linking
   to a single job via ?job=<slug>.
   Fails silently to the static fallback markup if the API is unreachable.
   ════════════════════════════════════════════════════════════════ */
(function () {
  var FALLBACK_MAILTO = 'mailto:info@apexrmgroup.com?subject=Job%20Application';
  var allJobs = [];
  var apiBase = '';
  var activeTab = 'all';

  function getApiBase() {
    var loaderScript = document.querySelector('script[src*="cms-loader.js"]');
    return loaderScript ? (loaderScript.getAttribute('data-api') || '').replace(/\/$/, '') : '';
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function iconHtml(icon, iconUrl) {
    var url = iconUrl && (iconUrl.indexOf('http') === 0 || iconUrl.indexOf('//') === 0) ? iconUrl
            : (icon && (icon.indexOf('http') === 0 || icon.indexOf('//') === 0) ? icon : '');
    if (url) return '<img src="' + escapeHtml(url) + '" alt="" loading="lazy">';
    return icon ? escapeHtml(icon) : '';
  }

  function trackApplyClick(jobId) {
    if (!apiBase || !jobId) return;
    fetch(apiBase + '/api/public/careers/' + jobId + '/track-apply', { method: 'POST', mode: 'cors' }).catch(function () {});
  }

  function applyButtonHtml(job) {
    var href = job.externalUrl || FALLBACK_MAILTO;
    return '<a class="btn-primary apply-now-btn" href="' + escapeHtml(href) + '" target="_blank" rel="noopener noreferrer" data-job-id="' + escapeHtml(job.id) + '" style="white-space:nowrap;">Apply Now</a>';
  }

  function jobCardHtml(job, idx) {
    var meta = [];
    if (job.type) meta.push('<span class="job-tag type">' + escapeHtml(job.type) + '</span>');
    if (job.location) meta.push('<span class="job-tag location">📍 ' + escapeHtml(job.location) + '</span>');
    if (job.deadline) {
      var d = new Date(job.deadline);
      var dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      meta.push('<span class="job-tag deadline">⏳ Deadline: ' + escapeHtml(dateStr) + '</span>');
    }
    var detailsId = 'job-details-' + idx;
    var hasDescription = job.description && job.description.replace(/<[^>]*>/g, '').trim().length > 0;
    var shareUrl = job.slug ? ('?job=' + encodeURIComponent(job.slug)) : '#';
    var imageHtml = job.imageUrl
      ? '<div style="border-radius:10px;margin-bottom:1rem;background:#0a1628;overflow:hidden;"><img src="' + escapeHtml(job.imageUrl) + '" alt="" loading="lazy" style="width:100%;max-height:420px;object-fit:contain;display:block;"></div>'
      : '';

    // The job title itself is the link to the job opportunity (not a separate
    // "View Details" button) — clicking it toggles the description below.
    var titleHtml = hasDescription
      ? '<a class="job-title view-details-btn" href="' + escapeHtml(shareUrl) + '" data-target="' + detailsId + '" style="display:block;text-decoration:none;color:inherit;cursor:pointer;">' + escapeHtml(job.title) + '</a>'
      : '<div class="job-title">' + escapeHtml(job.title) + '</div>';

    var headerAction = hasDescription ? '' : applyButtonHtml(job);

    var detailsPanel = hasDescription
      ? '<div id="' + detailsId + '" class="job-description" style="display:none;margin-top:1rem;padding-top:1rem;border-top:1px solid rgba(10,22,40,0.08);line-height:1.8;">' +
          imageHtml +
          job.description +
          '<div style="margin-top:1.2rem;">' + applyButtonHtml(job) + '</div>' +
        '</div>'
      : '';

    var companyName = job.category === 'EXTERNAL' ? (job.companyName || '') : 'Apex R&M Group';

    return (
      '<div class="job-card reveal" id="job-' + escapeHtml(job.slug || '') + '" data-category="' + escapeHtml(job.category || 'INTERNAL') + '" style="flex-direction:column;align-items:stretch;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap;">' +
          '<div class="job-info">' +
            titleHtml +
            (companyName ? '<div class="job-company" style="font-size:0.85rem;color:var(--gold-d,#9c7a1e);font-weight:600;margin:0.15rem 0 0.3rem;">' + escapeHtml(companyName) + '</div>' : '') +
            '<div class="job-meta">' + meta.join('') + '</div>' +
          '</div>' +
          (headerAction ? '<div style="display:flex;gap:0.6rem;flex-shrink:0;">' + headerAction + '</div>' : '') +
        '</div>' +
        detailsPanel +
      '</div>'
    );
  }

  // Scrolls so the job's title lands just below the fixed navbar — not
  // "no scroll" (the title may be off-screen, e.g. via a deep link) and not
  // scrolled toward the description (which used block:'center' and dragged
  // the whole card, description included, up the page).
  function scrollToJobTitle(card) {
    var titleEl = card.querySelector('.job-title') || card;
    var navbar = document.getElementById('navbar');
    var offset = (navbar ? navbar.offsetHeight : 0) + 16;
    var top = titleEl.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: top, behavior: 'smooth' });
  }

  function closeAllJobDetails(list) {
    list.querySelectorAll('.job-description').forEach(function (panel) {
      panel.style.display = 'none';
    });
    list.querySelectorAll('.job-card').forEach(function (card) {
      card.classList.remove('details-open');
    });
    history.replaceState(null, '', window.location.pathname);
  }

  function wireJobCardEvents(list) {
    // The whole card is the click target to open a job's description —
    // not just its title. Clicking inside an already-open card (including
    // its expanded description text) is a no-op rather than closing it;
    // only a genuine click outside the card closes it (see the
    // document-level listener below).
    list.querySelectorAll('.job-card').forEach(function (card) {
      var details = card.querySelector('.job-description');
      if (!details) return; // nothing to expand — no Apply Now-only card
      var titleLink = card.querySelector('.view-details-btn');
      card.style.cursor = 'pointer';

      card.addEventListener('click', function (e) {
        if (e.target.closest('.apply-now-btn')) return; // let Apply Now navigate normally
        if (card.classList.contains('details-open')) return; // already open — leave it open
        e.preventDefault();

        closeAllJobDetails(list);
        details.style.display = 'block';
        card.classList.add('details-open');
        scrollToJobTitle(card);
        if (titleLink) history.replaceState(null, '', titleLink.getAttribute('href'));
      });
    });

    list.querySelectorAll('.apply-now-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        trackApplyClick(btn.getAttribute('data-job-id'));
      });
    });
  }

  // Bound once (not per-render, since renderJobsList() re-runs on every tab
  // switch) — clicking anywhere outside the currently-open job's card closes
  // its description, so other opportunities are easy to get back to.
  document.addEventListener('click', function (e) {
    var list = document.getElementById('jobs-list');
    if (!list) return;
    var openCard = list.querySelector('.job-card.details-open');
    if (!openCard || openCard.contains(e.target)) return;
    closeAllJobDetails(list);
  });

  function renderJobsList() {
    var list = document.getElementById('jobs-list');
    if (!list) return;

    var jobs = allJobs.filter(function (j) {
      if (activeTab === 'internal') return j.category !== 'EXTERNAL';
      if (activeTab === 'external') return j.category === 'EXTERNAL';
      return true;
    });

    if (!jobs.length) {
      list.innerHTML = '<p style="text-align:center;color:var(--gray);padding:1.5rem 0;">No open positions in this category right now — check back soon.</p>';
      return;
    }

    list.innerHTML = jobs.map(jobCardHtml).join('');
    wireJobCardEvents(list);
    expandDeepLinkedJob(list);
  }

  function expandDeepLinkedJob(list) {
    var params = new URLSearchParams(window.location.search);
    var slug = params.get('job');
    if (!slug) return;
    var card = document.getElementById('job-' + slug);
    if (!card || !list.contains(card)) return;

    var details = card.querySelector('.job-description');
    if (details) {
      details.style.display = 'block';
      card.classList.add('details-open');
    }
    // Scroll to the job's title (not its description) so a shared link
    // brings the right opening into view without jumping past it.
    setTimeout(function () { scrollToJobTitle(card); }, 50);
  }

  function wireTabs() {
    var tabsEl = document.getElementById('jobs-tabs');
    if (!tabsEl) return;
    tabsEl.querySelectorAll('.jobs-tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        tabsEl.querySelectorAll('.jobs-tab-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        activeTab = btn.getAttribute('data-tab') || 'all';
        renderJobsList();
      });
    });
  }

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el && value) el.textContent = value;
  }

  function renderIconCards(containerId, cards, cardClass, iconClass, titleTag) {
    var container = document.getElementById(containerId);
    if (!container || !cards || !cards.length) return;
    container.innerHTML = cards.map(function (c) {
      return (
        '<div class="' + cardClass + ' reveal">' +
          '<div class="' + iconClass + '">' + iconHtml(c.icon, c.iconUrl) + '</div>' +
          '<' + titleTag + '>' + escapeHtml(c.title) + '</' + titleTag + '>' +
          '<p>' + escapeHtml(c.description) + '</p>' +
        '</div>'
      );
    }).join('');
  }

  function renderPageContent(content) {
    if (!content) return;

    if (content.culture) {
      try {
        var culture = JSON.parse(content.culture);
        setText('culture-label', culture.sectionLabel);
        setText('culture-title', culture.title);
        setText('culture-subtitle', culture.subtitle);
        renderIconCards('culture-grid', culture.cards, 'culture-card', 'culture-icon', 'h3');
      } catch (e) { /* keep static fallback markup */ }
    }

    if (content.benefits) {
      try {
        var benefits = JSON.parse(content.benefits);
        setText('benefits-label', benefits.sectionLabel);
        setText('benefits-title', benefits.title);
        renderIconCards('benefits-grid', benefits.cards, 'benefit-item', 'benefit-icon', 'h4');
      } catch (e) { /* keep static fallback markup */ }
    }

    if (content.graduate) {
      try {
        var graduate = JSON.parse(content.graduate);
        setText('graduate-label', graduate.label);
        setText('graduate-title', graduate.title);
        setText('graduate-paragraph1', graduate.paragraph1);
        setText('graduate-paragraph2', graduate.paragraph2);
        setText('graduate-button', graduate.buttonText);
        var boxesEl = document.getElementById('graduate-info-boxes');
        if (boxesEl && graduate.infoBoxes && graduate.infoBoxes.length) {
          boxesEl.innerHTML = graduate.infoBoxes.map(function (b) {
            return (
              '<div class="glass-card" style="padding:1.2rem;">' +
                '<div style="font-family:var(--font-ui);font-size:0.65rem;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:var(--gold);margin-bottom:0.5rem;">' + escapeHtml(b.label) + '</div>' +
                '<div style="color:white;font-size:0.9rem;">' + escapeHtml(b.value) + '</div>' +
              '</div>'
            );
          }).join('');
        }
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
    apiBase = getApiBase();
    wireTabs();

    if (!apiBase) return;

    fetch(apiBase + '/api/public/careers', { mode: 'cors' })
      .then(function (res) { return res.ok ? res.json() : { items: [] }; })
      .then(function (data) {
        allJobs = data.items || [];
        renderJobsList();
      })
      .catch(function () { /* keep static fallback markup */ });

    fetch(apiBase + '/api/public/content?page=careers', { mode: 'cors' })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) { renderPageContent(data && data.content); })
      .catch(function () { /* keep static fallback markup */ });
  });
})();

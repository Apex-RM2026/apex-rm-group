/* ════════════════════════════════════════════════════════════════
   CAREERS — dynamic job listings + application submission
   Pulls open vacancies from the Admin Portal and wires the apply form.
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

  function renderJobsInto(containerId, jobs, emptyMessage) {
    var list = document.getElementById(containerId);
    if (!list) return;

    if (!jobs.length) {
      list.innerHTML = '<p style="text-align:center;color:var(--gray);padding:1.5rem 0;">' + emptyMessage + '</p>';
      return;
    }

    list.innerHTML = jobs.map(function (job, idx) {
      var meta = [];
      if (job.type) meta.push('<span class="job-tag type">' + escapeHtml(job.type) + '</span>');
      if (job.location) meta.push('<span class="job-tag location">📍 ' + escapeHtml(job.location) + '</span>');
      if (job.deadline) {
        var d = new Date(job.deadline);
        var dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        meta.push('<span class="job-tag deadline">⏳ Deadline: ' + escapeHtml(dateStr) + '</span>');
      }
      var detailsId = containerId + '-details-' + idx;
      var hasDescription = job.description && job.description.replace(/<[^>]*>/g, '').trim().length > 0;
      return (
        '<div class="job-card reveal" style="flex-direction:column;align-items:stretch;">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap;">' +
            '<div class="job-info">' +
              '<div class="job-title">' + escapeHtml(job.title) + '</div>' +
              '<div class="job-meta">' + meta.join('') + '</div>' +
            '</div>' +
            '<div style="display:flex;gap:0.6rem;flex-shrink:0;">' +
              (hasDescription ? '<button class="btn-secondary view-details-btn" type="button" data-target="' + detailsId + '" style="white-space:nowrap;">View Details</button>' : '') +
              '<button class="btn-primary apply-now-btn" type="button" data-job-id="' + escapeHtml(job.id) + '" style="white-space:nowrap;">Apply Now</button>' +
            '</div>' +
          '</div>' +
          (hasDescription ? '<div id="' + detailsId + '" class="job-description" style="display:none;margin-top:1rem;padding-top:1rem;border-top:1px solid rgba(10,22,40,0.08);line-height:1.8;">' + job.description + '</div>' : '') +
        '</div>'
      );
    }).join('');

    list.querySelectorAll('.view-details-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = document.getElementById(btn.getAttribute('data-target'));
        if (!target) return;
        var isOpen = target.style.display !== 'none';
        target.style.display = isOpen ? 'none' : 'block';
        btn.textContent = isOpen ? 'View Details' : 'Hide Details';
      });
    });

    list.querySelectorAll('.apply-now-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var select = document.getElementById('apply-position');
        if (select) select.value = btn.getAttribute('data-job-id');
        var modal = document.getElementById('apply-modal');
        if (modal) modal.classList.add('open');
      });
    });
  }

  function renderJobs(jobs) {
    var select = document.getElementById('apply-position');
    var internal = jobs.filter(function (j) { return j.category !== 'EXTERNAL'; });
    var external = jobs.filter(function (j) { return j.category === 'EXTERNAL'; });

    renderJobsInto('jobs-list-internal', internal, 'No internal positions right now — check back soon, or send us your CV anyway using the button below.');
    renderJobsInto('jobs-list-external', external, 'No external opportunities published right now — check back soon.');

    if (select) {
      if (!jobs.length) {
        select.innerHTML = '<option value="">No open positions at the moment</option>';
      } else {
        select.innerHTML = '<option value="">Select a position...</option>' +
          jobs.map(function (job) {
            return '<option value="' + escapeHtml(job.id) + '">' + escapeHtml(job.title) + '</option>';
          }).join('');
      }
    }
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
          '<div class="' + iconClass + '">' + escapeHtml(c.icon) + '</div>' +
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

  function showFormMessage(text, isError) {
    var el = document.getElementById('apply-form-msg');
    if (!el) return;
    el.textContent = text;
    el.style.display = text ? 'block' : 'none';
    el.style.color = isError ? '#c0392b' : '#1a7a3c';
  }

  function wireApplyForm(apiBase) {
    var form = document.getElementById('apply-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var jobId = document.getElementById('apply-position').value;
      var fullName = document.getElementById('apply-fullname').value.trim();
      var email = document.getElementById('apply-email').value.trim();
      var phone = document.getElementById('apply-phone').value.trim();
      var linkedin = document.getElementById('apply-linkedin').value.trim();
      var coverLetterText = document.getElementById('apply-coverletter').value.trim();
      var cvInput = document.getElementById('apply-cv');
      var cvFile = cvInput.files && cvInput.files[0];

      if (!jobId) { showFormMessage('Please select a position.', true); return; }
      if (!fullName || !email || !coverLetterText) { showFormMessage('Please fill in all required fields.', true); return; }
      if (!cvFile) { showFormMessage('Please attach your CV.', true); return; }
      if (!apiBase) { showFormMessage('Submission is temporarily unavailable. Please email us directly.', true); return; }

      var coverLetter = linkedin ? ('LinkedIn: ' + linkedin + '\n\n' + coverLetterText) : coverLetterText;

      var fd = new FormData();
      fd.append('jobId', jobId);
      fd.append('fullName', fullName);
      fd.append('email', email);
      if (phone) fd.append('phone', phone);
      fd.append('coverLetter', coverLetter);
      fd.append('cv', cvFile);

      var btn = document.getElementById('apply-submit-btn');
      btn.disabled = true;
      showFormMessage('Submitting your application...', false);

      fetch(apiBase + '/api/public/careers/apply', { method: 'POST', mode: 'cors', body: fd })
        .then(function (res) { return res.json().then(function (json) { return { ok: res.ok, json: json }; }); })
        .then(function (result) {
          if (result.ok) {
            showFormMessage('Application submitted — thank you! We will be in touch.', false);
            form.reset();
            setTimeout(function () {
              var modal = document.getElementById('apply-modal');
              if (modal) modal.classList.remove('open');
              showFormMessage('', false);
            }, 2500);
          } else {
            showFormMessage(result.json.error || 'Submission failed. Please try again.', true);
          }
        })
        .catch(function () {
          showFormMessage('Network error — please try again or email us directly.', true);
        })
        .finally(function () {
          btn.disabled = false;
        });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var apiBase = getApiBase();
    wireApplyForm(apiBase);

    if (!apiBase) return;

    fetch(apiBase + '/api/public/careers', { mode: 'cors' })
      .then(function (res) { return res.ok ? res.json() : { items: [] }; })
      .then(function (data) { renderJobs(data.items || []); })
      .catch(function () { /* keep static fallback markup */ });

    fetch(apiBase + '/api/public/content?page=careers', { mode: 'cors' })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) { renderPageContent(data && data.content); })
      .catch(function () { /* keep static fallback markup */ });
  });
})();

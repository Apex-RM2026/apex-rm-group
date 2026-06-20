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

  function renderJobs(jobs) {
    var list = document.getElementById('jobs-list');
    var select = document.getElementById('apply-position');
    if (!list || !select) return;

    if (!jobs.length) {
      list.innerHTML = '<p style="text-align:center;color:var(--gray);padding:2rem 0;">No open positions right now — check back soon, or send us your CV anyway using the button below.</p>';
      select.innerHTML = '<option value="">No open positions at the moment</option>';
      return;
    }

    list.innerHTML = jobs.map(function (job) {
      var meta = [];
      if (job.type) meta.push('<span class="job-tag type">' + escapeHtml(job.type) + '</span>');
      if (job.location) meta.push('<span class="job-tag location">📍 ' + escapeHtml(job.location) + '</span>');
      if (job.deadline) {
        var d = new Date(job.deadline);
        var dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        meta.push('<span class="job-tag deadline">⏳ Deadline: ' + escapeHtml(dateStr) + '</span>');
      }
      return (
        '<div class="job-card reveal">' +
          '<div class="job-info">' +
            '<div class="job-title">' + escapeHtml(job.title) + '</div>' +
            '<div class="job-meta">' + meta.join('') + '</div>' +
          '</div>' +
          '<button class="btn-primary apply-now-btn" type="button" data-job-id="' + escapeHtml(job.id) + '" style="white-space:nowrap;flex-shrink:0;">Apply Now</button>' +
        '</div>'
      );
    }).join('');

    select.innerHTML = '<option value="">Select a position...</option>' +
      jobs.map(function (job) {
        return '<option value="' + escapeHtml(job.id) + '">' + escapeHtml(job.title) + '</option>';
      }).join('');

    list.querySelectorAll('.apply-now-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        select.value = btn.getAttribute('data-job-id');
        var modal = document.getElementById('apply-modal');
        if (modal) modal.classList.add('open');
      });
    });
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
  });
})();

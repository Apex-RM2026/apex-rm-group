/* ════════════════════════════════════════════════════════════════
   CONTACT PAGE — renders the Admin Portal-managed sections that the
   generic cms-loader.js can't handle on its own: the contact-info
   labels/sub-notes, the "Find Us" map (including its lat/lng/zoom —
   see window.apexInitContactMap in script.js), and the FAQ list.
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

  function renderFaqs(items) {
    var list = document.getElementById('faq-list');
    if (!list || !items || !items.length) return;
    list.innerHTML = items.map(function (item) {
      return (
        '<div class="faq-item">' +
          '<button class="faq-question">' + escapeHtml(item.q) + ' <i class="fa-solid fa-plus"></i></button>' +
          '<div class="faq-answer">' + escapeHtml(item.a) + '</div>' +
        '</div>'
      );
    }).join('');

    // The FAQ accordion click handler in script.js is bound once at load
    // against the original static buttons — re-bind it against the fresh
    // ones we just created, same idea as the testimonial carousel re-bind.
    list.querySelectorAll('.faq-question').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.faq-item');
        var isOpen = item.classList.contains('open');
        list.querySelectorAll('.faq-item.open').forEach(function (el) { el.classList.remove('open'); });
        if (!isOpen) item.classList.add('open');
      });
    });
  }

  function renderContent(content, settings) {
    if (!content) return;

    if (content.overview) {
      try {
        var overview = JSON.parse(content.overview);
        setText('overview-label', overview.sectionLabel);
        setText('overview-title', overview.title);
      } catch (e) { /* keep static fallback markup */ }
    }

    if (content.info) {
      try {
        var info = JSON.parse(content.info);
        setText('headquarters-label', info.headquartersLabel);
        setText('headquarters-subtext', info.headquartersSubtext);
        setText('email-label', info.emailLabel);
        setText('business-dev-label', info.businessDevLabel);
        if (info.businessDevEmail) {
          var bd = document.getElementById('business-dev-email');
          if (bd) { bd.textContent = info.businessDevEmail; bd.setAttribute('href', 'mailto:' + info.businessDevEmail); }
        }
        setText('phone-label', info.phoneLabel);
        setText('whatsapp-label', info.whatsappLabel);
        setText('whatsapp-hours', info.whatsappHours);
        setText('languages-label', info.languagesLabel);
        setText('languages-text', info.languages);
        setText('follow-us-label', info.followUsLabel);
      } catch (e) { /* keep static fallback markup */ }
    }

    if (content.responseCommitment) setHtml('response-commitment', content.responseCommitment);

    if (content.formHeader) {
      try {
        var formHeader = JSON.parse(content.formHeader);
        setText('form-title', formHeader.title);
        setText('form-subtitle', formHeader.subtitle);
      } catch (e) { /* keep static fallback markup */ }
    }

    if (content.faqHeader) {
      try {
        var faqHeader = JSON.parse(content.faqHeader);
        setText('faq-label', faqHeader.sectionLabel);
        setText('faq-title', faqHeader.title);
      } catch (e) { /* keep static fallback markup */ }
    }

    if (content.faqs) {
      try {
        var faqs = JSON.parse(content.faqs);
        renderFaqs(faqs.items);
      } catch (e) { /* keep static fallback markup */ }
    }

    var mapSection = null;
    if (content.mapSection) {
      try { mapSection = JSON.parse(content.mapSection); } catch (e) { /* ignore */ }
    }
    if (mapSection) {
      setText('map-label', mapSection.sectionLabel);
      setText('map-title', mapSection.title);
      setText('map-subtitle', mapSection.subtitle);
    }
    if (mapSection && mapSection.lat && mapSection.lng && window.apexInitContactMap) {
      var address = (settings && settings.contact_address) || 'Kamonyi District, Runda Sector, Ruyenzi Cell, Nyagacaca Village, Presto Plazza.';
      var email = (settings && settings.contact_email) || 'info@apexrmgroup.com';
      var popupHtml = '<b style="font-family:Georgia">APEX R&M GROUP</b><br>' + escapeHtml(address) + '<br><a href="mailto:' + escapeHtml(email) + '" style="color:#1A6B8A">' + escapeHtml(email) + '</a>';
      window.apexInitContactMap(Number(mapSection.lat), Number(mapSection.lng), Number(mapSection.zoom) || 13, popupHtml);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var apiBase = getApiBase();
    if (!apiBase) return;

    Promise.all([
      fetch(apiBase + '/api/public/content?page=contact', { mode: 'cors' }).then(function (res) { return res.ok ? res.json() : null; }).catch(function () { return null; }),
      fetch(apiBase + '/api/public/settings', { mode: 'cors' }).then(function (res) { return res.ok ? res.json() : null; }).catch(function () { return null; }),
    ]).then(function (results) {
      renderContent(results[0] && results[0].content, results[1] && results[1].settings);
    });
  });
})();

/* ════════════════════════════════════════════════════════════════
   TEAM — dynamic team member listing
   Pulls published team members from the Admin Portal and replaces the
   static grid. Keeps the static fallback markup only if the API call
   itself fails/is unreachable — a successful call that legitimately
   returns zero published members (the admin unpublished everyone)
   must still clear the grid, not be mistaken for a failed request.
   ════════════════════════════════════════════════════════════════ */
(function () {
  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function renderTeam(members) {
    var grid = document.querySelector('.team-grid');
    if (!grid) return;

    if (!members.length) {
      grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--gray);padding:2rem 0;">Team profiles are being updated — check back shortly.</p>';
      return;
    }

    grid.innerHTML = members.map(function (m) {
      var initials = (m.fullName || '').split(' ').map(function (p) { return p[0]; }).join('').slice(0, 2).toUpperCase();
      var photo = m.photoUrl
        ? '<div class="team-photo-placeholder"><img src="' + escapeHtml(m.photoUrl) + '" alt="' + escapeHtml(m.fullName) + '"></div>'
        : '<div class="team-photo-placeholder">' + escapeHtml(initials) + '</div>';
      var linkedin = m.linkedinUrl
        ? '<div class="team-photo-overlay"><a href="' + escapeHtml(m.linkedinUrl) + '" target="_blank" rel="noopener" class="team-linkedin"><i class="fa-brands fa-linkedin-in"></i> LinkedIn Profile</a></div>'
        : '';
      return (
        '<div class="team-card reveal">' +
          '<div class="team-photo">' + photo + linkedin + '</div>' +
          '<div class="team-body">' +
            '<h3>' + escapeHtml(m.fullName) + '</h3>' +
            '<div class="team-title">' + escapeHtml(m.role) + '</div>' +
            '<p class="team-expertise">' + escapeHtml(m.bio) + '</p>' +
          '</div>' +
        '</div>'
      );
    }).join('');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var loaderScript = document.querySelector('script[src*="cms-loader.js"]');
    var apiBase = loaderScript ? (loaderScript.getAttribute('data-api') || '').replace(/\/$/, '') : '';
    if (!apiBase) return;

    fetch(apiBase + '/api/public/team', { mode: 'cors' })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) { if (data) renderTeam(data.items || []); /* null = request failed, keep static fallback markup */ })
      .catch(function () { /* keep static fallback markup */ });
  });
})();

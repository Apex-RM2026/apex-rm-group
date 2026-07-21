/* ════════════════════════════════════════════════════════════════
   HOME PAGE — renders the Admin Portal-managed sections that the
   generic cms-loader.js can't handle on its own (repeatable card
   lists stored as JSON blobs: stats strip, services overview,
   why-choose-us points, client logos, testimonials carousel, and
   the insights preview cards).
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
    if (!grid || !cards) return;
    if (!cards.length) { grid.innerHTML = ''; return; }
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
    if (!grid || !points) return;
    if (!points.length) { grid.innerHTML = ''; return; }
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

  function mediaHtml(slot) {
    if (!slot || !slot.items || !slot.items.length) return '';
    if (slot.mode === 'SLIDER' && slot.items.length > 1) {
      return (
        '<div class="cms-slider" style="position:relative; width:100%; height:100%; overflow:hidden;">' +
          '<div class="cms-slider-track">' +
            slot.items.map(function (item, idx) {
              return '<img class="cms-slider-img" src="' + escapeHtml(item.url) + '" alt="' + escapeHtml(item.altText || '') + '" loading="lazy" style="opacity:' + (idx === 0 ? 1 : 0) + ';">';
            }).join('') +
          '</div>' +
        '</div>'
      );
    }
    return '<img src="' + escapeHtml(slot.items[0].url) + '" alt="" loading="lazy">';
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

  function renderClientLogos(items) {
    var grid = document.getElementById('client-logos-grid');
    if (!grid || !items) return;
    if (!items.length) { grid.innerHTML = ''; return; }
    grid.innerHTML = items.map(function (item) {
      var inner = item.logo
        ? '<img src="' + escapeHtml(item.logo) + '" alt="' + escapeHtml(item.name) + '" loading="lazy">'
        : escapeHtml(item.name);
      return '<div class="client-logo-item' + (item.logo ? ' has-logo' : '') + '">' + inner + '</div>';
    }).join('');
  }

  function renderStats(items) {
    if (!items || !items.length) return;
    items.slice(0, 4).forEach(function (s, idx) {
      var n = idx + 1;
      var numEl = document.getElementById('stat-' + n + '-num');
      if (numEl && s.num) {
        if (/^-?\d+$/.test(String(s.num).trim())) {
          // Numeric — prime at 0 and let the count-up animation run.
          numEl.setAttribute('data-count', s.num);
          numEl.textContent = '0';
        } else {
          // Non-numeric (e.g. "TBD") — no animation, just show it as-is.
          numEl.removeAttribute('data-count');
          numEl.textContent = s.num;
        }
      }
      setText('stat-' + n + '-suffix', s.suffix);
      setText('stat-' + n + '-label', s.label);
    });
    if (window.apexRestartCounters) window.apexRestartCounters();
  }

  function renderTestimonials(items) {
    var carousel = document.getElementById('testimonials-carousel');
    if (!carousel || !items) return;
    var inner = carousel.querySelector('.testimonials-inner');
    var dots = carousel.querySelector('.carousel-dots');
    if (!inner || !dots) return;

    if (!items.length) { inner.innerHTML = ''; dots.innerHTML = ''; return; }

    inner.innerHTML = items.map(function (t) {
      var stars = Math.max(1, Math.min(5, parseInt(t.stars, 10) || 5));
      return (
        '<div class="testimonial-slide">' +
          '<div class="testimonial-card">' +
            '<div class="testimonial-stars">' + '★'.repeat(stars) + '</div>' +
            '<p class="testimonial-quote">&ldquo;' + escapeHtml(t.quote) + '&rdquo;</p>' +
            '<div class="testimonial-author">' +
              '<div class="testimonial-avatar">' + escapeHtml(t.initials) + '</div>' +
              '<div class="testimonial-info">' +
                '<div class="name">' + escapeHtml(t.name) + '</div>' +
                '<div class="role">' + escapeHtml(t.role) + '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    dots.innerHTML = items.map(function (_, idx) {
      return '<button class="carousel-dot' + (idx === 0 ? ' active' : '') + '"></button>';
    }).join('');

    if (window.apexInitTestimonialCarousel) window.apexInitTestimonialCarousel(carousel);
  }

  function renderInsightCards(posts, mediaSlots) {
    var grid = document.getElementById('insights-preview-grid');
    if (!grid || !posts) return;
    if (!posts.length) { grid.innerHTML = ''; return; }
    grid.innerHTML = posts.map(function (post, idx) {
      var slot = post.key && mediaSlots ? mediaSlots['insight_' + post.key + '_image'] : null;
      // Posts saved before per-post photo slots existed only have a flat
      // post.image URL — keep showing that until the admin re-saves the photo.
      var photo = slot ? mediaHtml(slot) : (post.image ? '<img src="' + escapeHtml(post.image) + '" alt="' + escapeHtml(post.title) + '" loading="lazy">' : '');
      return (
        '<div class="blog-card reveal" data-delay="' + ((idx % 3) * 100 + 100) + '">' +
          '<div class="blog-image">' + photo + '</div>' +
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

    startSliders(grid);
  }

  function renderHeroImages(slot) {
    var bg = document.getElementById('hero-bg');
    if (!bg || !slot || !slot.items || !slot.items.length) return;
    var items = slot.items;
    var loaded = 0;
    var total = items.length;
    function swap() {
      if (window._heroTimer) clearInterval(window._heroTimer);
      bg.innerHTML = items.map(function(item, idx) {
        return '<img src="' + escapeHtml(item.url) + '" class="hero-slide' + (idx === 0 ? ' hero-slide-active' : '') + '" alt="' + escapeHtml(item.altText || '') + '"' + (idx === 0 ? ' fetchpriority="high"' : ' loading="lazy"') + '>';
      }).join('');
      if (items.length >= 2) {
        var slides = bg.querySelectorAll('.hero-slide');
        var cur = 0;
        window._heroTimer = setInterval(function() {
          slides[cur].classList.remove('hero-slide-active');
          cur = (cur + 1) % slides.length;
          slides[cur].classList.add('hero-slide-active');
        }, 7000);
      }
    }
    items.forEach(function(item) {
      var img = new window.Image();
      img.onload = img.onerror = function() { loaded++; if (loaded === total) swap(); };
      img.src = item.url;
    });
  }

  function renderContent(content, mediaSlots) {
    if (mediaSlots && mediaSlots['hero_image']) renderHeroImages(mediaSlots['hero_image']);
    if (!content) return;

    if (content.stats) {
      try {
        var stats = JSON.parse(content.stats);
        renderStats(stats.items);
      } catch (e) { /* keep static fallback markup */ }
    }

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

    if (content.testimonials) {
      try {
        var testimonials = JSON.parse(content.testimonials);
        setText('testimonials-label', testimonials.sectionLabel);
        setText('testimonials-title', testimonials.title);
        renderTestimonials(testimonials.items);
      } catch (e) { /* keep static fallback markup */ }
    }

    if (content.insights_preview) {
      try {
        var insights = JSON.parse(content.insights_preview);
        setText('insights-preview-label', insights.sectionLabel);
        setText('insights-preview-title', insights.title);
        setText('insights-preview-subtitle', insights.subtitle);
        renderInsightCards(insights.posts, mediaSlots);
      } catch (e) { /* keep static fallback markup */ }
    }

    if (content.cta) {
      try {
        var cta = JSON.parse(content.cta);
        setText('cta-heading', cta.heading);
        setText('cta-emphasis', cta.emphasis);
        setText('cta-paragraph', cta.paragraph);
      } catch (e) { /* keep static fallback markup */ }
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var apiBase = getApiBase();
    if (!apiBase) return;

    Promise.all([
      fetch(apiBase + '/api/public/content?page=index', { mode: 'cors' }).then(function (res) { return res.ok ? res.json() : null; }).catch(function () { return null; }),
      fetch(apiBase + '/api/public/media-slots?page=index', { mode: 'cors' }).then(function (res) { return res.ok ? res.json() : null; }).catch(function () { return null; }),
    ]).then(function (results) {
      renderContent(results[0] && results[0].content, results[1] && results[1].slots);
    });
  });
})();

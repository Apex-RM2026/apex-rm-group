/* ============================================================
   APEX R&M GROUP — messages.js (FIXED)
   Contact Form: Preserves Admin Portal + Fixes Email Delivery
   ============================================================ */

'use strict';

/* ── CONFIGURATION ── */
const APEX_MSG_CONFIG = {
  // EmailJS Configuration (YOUR credentials)
  emailjs: {
    publicKey:  'AjrKDbhnDmViU1AE8',
    serviceId:  'service_hpantj2',
    templateId: 'template_b3729sx'
  },
  // Supabase disabled (email only mode)
  supabase: {
    url: '',
    anonKey: '',
    table: ''
  }
};

/* ── SUPABASE FUNCTIONS (disabled but kept for compatibility) ── */
let _sb = null;
function getSupabase() { return null; }
async function apexSaveToSupabase(msg) { return false; }
async function apexLoadFromSupabase() { return null; }
async function apexMarkReadSupabase(id) {}
async function apexMarkAllReadSupabase() {}
async function apexDeleteSupabase(id) {}

/* ── EMAILJS FUNCTION ── */
async function apexSendEmail(msg) {
  if (typeof emailjs === 'undefined') {
    console.warn('[APEX] EmailJS not loaded');
    return false;
  }
  try {
    await emailjs.send(
      APEX_MSG_CONFIG.emailjs.serviceId,
      APEX_MSG_CONFIG.emailjs.templateId,
      {
        from_name:  msg.name || 'Unknown',
        from_email: msg.email || '',
        from_org:   msg.org || '—',
        phone:      msg.phone || '—',
        country:    msg.country || '—',
        service:    msg.service || '—',
        budget:     msg.budget || '—',
        message:    msg.message || '',
        sent_time:  new Date().toLocaleString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        })
      }
    );
    return true;
  } catch(e) {
    console.error('[APEX] EmailJS send failed:', e);
    return false;
  }
}

/* ── PATCH APEX_CMS (preserves admin portal functionality) ── */
const _origAddMessage = (typeof APEX_CMS !== 'undefined') && APEX_CMS.addMessage.bind(APEX_CMS);
const _origGetMessages = (typeof APEX_CMS !== 'undefined') && APEX_CMS.getMessages.bind(APEX_CMS);

if (typeof APEX_CMS !== 'undefined') {
  // Add async version for email sending
  APEX_CMS.addMessageAsync = async function(msg) {
    // Save to localStorage (admin portal gets messages from here)
    if (_origAddMessage) _origAddMessage(msg);
    // Send email notification
    const emailOk = await apexSendEmail(msg);
    return { ok: true, emailOk };
  };

  // Keep original getMessages (admin portal uses this)
  APEX_CMS.getMessages = function() {
    return _origGetMessages ? _origGetMessages() : [];
  };
}

/* ── ADMIN PORTAL FUNCTIONS (kept for compatibility) ── */
window.apexLoadMessages = async function() {
  if (typeof renderMsgs === 'function') renderMsgs();
  if (typeof updateMsgBadge === 'function') updateMsgBadge();
};

/* ── CONTACT FORM HANDLER ── */
function apexWireContactForm() {
  const form = document.getElementById('apex-contact-form');
  if (!form) {
    console.error('[APEX] Form not found');
    return;
  }

  // Clone to remove existing listeners
  const fresh = form.cloneNode(true);
  form.parentNode.replaceChild(fresh, form);

  fresh.addEventListener('submit', async function(e) {
    e.preventDefault();

    const get = id => {
      const el = document.getElementById(id);
      return el ? el.value.trim() : '';
    };

    const msg = {
      name:    get('full-name'),
      org:     get('organisation'),
      email:   get('email'),
      phone:   get('phone'),
      country: get('country'),
      service: get('service'),
      budget:  get('budget'),
      message: get('brief'),
      subject: `Website enquiry — ${get('service') || 'General'}`
    };

    // Validation
    if (!msg.name || !msg.email || !msg.message) {
      _apexShowFormMsg(fresh, 'error',
        'Please fill in all required fields (Name, Email, Project Brief).');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(msg.email)) {
      _apexShowFormMsg(fresh, 'error', 'Please enter a valid email address.');
      return;
    }

    // Disable submit button
    const btn = fresh.querySelector('button[type="submit"]');
    const origBtnHTML = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending…';
    }

    try {
      // Save to localStorage (admin portal) AND send email
      let emailOk = false;
      
      if (typeof APEX_CMS !== 'undefined' && APEX_CMS.addMessageAsync) {
        const result = await APEX_CMS.addMessageAsync(msg);
        emailOk = result.emailOk;
      } else if (typeof APEX_CMS !== 'undefined' && APEX_CMS.addMessage) {
        // Fallback: save to localStorage only
        APEX_CMS.addMessage(msg);
        emailOk = await apexSendEmail(msg);
      } else {
        emailOk = await apexSendEmail(msg);
      }

      // Show success message
      const wrap = fresh.parentNode;
      wrap.innerHTML = `
        <div style="text-align:center;padding:3.5rem 2rem;">
          <div style="font-size:3.5rem;margin-bottom:1.25rem;">✅</div>
          <h3 style="font-family:var(--font-heading);color:var(--navy);margin-bottom:0.75rem;">
            Message Sent Successfully!
          </h3>
          <p style="color:var(--gray);font-size:0.9rem;line-height:1.6;">
            Thank you, <strong>${_esc(msg.name)}</strong>. We have received your enquiry
            and will respond within <strong>24 business hours</strong>.
          </p>
          ${!emailOk ? '<p style="color:var(--gray);font-size:0.82rem;margin-top:0.75rem;">⚠️ Your message has been saved. We will review it shortly.</p>' : ''}
          <div style="margin-top:1.5rem;">
            <a href="index.html" style="color:var(--teal);font-size:0.85rem;">← Back to Home</a>
          </div>
        </div>`;

      // Refresh admin portal if open
      if (typeof renderMsgs === 'function') renderMsgs();
      if (typeof updateMsgBadge === 'function') updateMsgBadge();

    } catch(err) {
      console.error('[APEX] Form error:', err);
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = origBtnHTML;
      }
      _apexShowFormMsg(fresh, 'error',
        'Something went wrong. Please try again or email us directly at info.apexrmgroup@gmail.com');
    }
  });
}

/* ── HELPER FUNCTIONS ── */
function _apexShowFormMsg(form, type, text) {
  let banner = form.querySelector('.apex-form-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.className = 'apex-form-banner';
    const btn = form.querySelector('button[type="submit"]');
    if (btn) form.insertBefore(banner, btn);
    else form.appendChild(banner);
  }
  const isErr = type === 'error';
  banner.style.cssText = `
    margin-bottom:1rem;padding:.75rem 1rem;border-radius:6px;font-size:.83rem;
    background:${isErr ? 'rgba(231,76,60,.08)' : 'rgba(39,174,96,.08)'};
    border:1px solid ${isErr ? 'rgba(231,76,60,.35)' : 'rgba(39,174,96,.35)'};
    color:${isErr ? '#c0392b' : '#1e8449'};
  `;
  banner.textContent = text;
  banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => { if (banner.parentNode) banner.remove(); }, 6000);
}

function _esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── AUTO-INIT ── */
(function() {
  document.addEventListener('DOMContentLoaded', () => {
    // Initialize EmailJS
    if (typeof emailjs !== 'undefined' && APEX_MSG_CONFIG.emailjs.publicKey) {
      emailjs.init(APEX_MSG_CONFIG.emailjs.publicKey);
      console.log('[APEX] EmailJS initialized');
    }
    
    // Initialize contact form
    if (document.getElementById('apex-contact-form')) {
      apexWireContactForm();
    }
  });
})();

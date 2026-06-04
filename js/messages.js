/* ============================================================
   APEX R&M GROUP — messages.js
   Server-side storage via Supabase + EmailJS notifications
   Falls back to localStorage when Supabase is not configured.
   ============================================================

   ┌─────────────────────────────────────────────────────────┐
   │  SETUP — read this once, then never touch it again      │
   │                                                         │
   │  1. Go to https://supabase.com — create a FREE account  │
   │  2. Create a new project (choose any region)            │
   │  3. In the project: SQL Editor → paste & run the SQL    │
   │     from SUPABASE_SCHEMA.sql (in this same folder)      │
   │  4. Go to Settings → API                                │
   │  5. Copy "Project URL" → paste into SUPABASE_URL below  │
   │  6. Copy "anon / public" key → paste into SUPABASE_KEY  │
   │  7. Upload this file to your hosting. Done.             │
   └─────────────────────────────────────────────────────────┘ */

'use strict';

/* ── PASTE YOUR CREDENTIALS HERE ────────────────────────────── */
const SUPABASE_URL = 'https://mwnlojpaiemsjaisyopg.supabase.co/rest/v1/';          // e.g. https://abcdef.supabase.co
const SUPABASE_KEY = 'sb_publishable_6mDsC9RvXl2M5IoS3VnDFQ_s9lR-afQ';          // eyJhbGciOiJIUzI1NiIs...

const EMAILJS_PUBLIC_KEY  = 'AjrKDbhnDmViU1AE8';
const EMAILJS_SERVICE_ID  = 'service_hpantj2';
const EMAILJS_TEMPLATE_ID = 'template_b3729sx';

const TBL_MESSAGES = 'apex_messages';
const TBL_ADMINS   = 'apex_admins';
/* ─────────────────────────────────────────────────────────────── */

/* ── Supabase client (lazy — created only when credentials exist) ── */
let _sb = null;
function getSupabase() {
  if (_sb) return _sb;
  if (SUPABASE_URL && SUPABASE_KEY && typeof supabase !== 'undefined') {
    try { _sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY); } catch(e) {}
  }
  return _sb;
}
function hasSupabase() { return !!getSupabase(); }

/* ════════════════════════════════════════════════════════════════
   MESSAGES — contact form enquiries
   ════════════════════════════════════════════════════════════════ */

async function apexSaveToSupabase(msg) {
  const sb = getSupabase(); if (!sb) return false;
  try {
    const { error } = await sb.from(TBL_MESSAGES).insert({
      name: msg.name || '', org: msg.org || '', email: msg.email || '',
      phone: msg.phone || '', country: msg.country || '',
      service: msg.service || '', budget: msg.budget || '',
      message: msg.message || '', subject: msg.subject || '', read: false
    });
    if (error) { console.error('[APEX] Supabase insert:', error.message); return false; }
    return true;
  } catch(e) { console.error('[APEX] Supabase save failed:', e); return false; }
}

async function apexLoadFromSupabase() {
  const sb = getSupabase(); if (!sb) return null;
  try {
    const { data, error } = await sb.from(TBL_MESSAGES)
      .select('*').order('created_at', { ascending: false });
    return error ? null : data;
  } catch(e) { return null; }
}

async function apexMarkReadSupabase(id) {
  const sb = getSupabase(); if (!sb) return;
  try { await sb.from(TBL_MESSAGES).update({ read: true }).eq('id', id); } catch(e) {}
}

async function apexMarkAllReadSupabase() {
  const sb = getSupabase(); if (!sb) return;
  try { await sb.from(TBL_MESSAGES).update({ read: true }).eq('read', false); } catch(e) {}
}

async function apexDeleteSupabase(id) {
  const sb = getSupabase(); if (!sb) return;
  try { await sb.from(TBL_MESSAGES).delete().eq('id', id); } catch(e) {}
}

/* ── Admin portal message refresh ── */
window.apexLoadMessages = async function() {
  if (hasSupabase()) {
    const rows = await apexLoadFromSupabase();
    if (rows !== null && typeof APEX_CMS !== 'undefined') {
      const data = APEX_CMS.load();
      data.messages = rows.map(m => ({
        id:      m.id,
        name:    m.name,    org:     m.org,     email:   m.email,
        phone:   m.phone,   country: m.country, service: m.service,
        budget:  m.budget,  message: m.message, subject: m.subject,
        read:    m.read,
        time: new Date(m.created_at).toLocaleString('en-GB', {
          day:'2-digit', month:'short', year:'numeric',
          hour:'2-digit', minute:'2-digit'
        })
      }));
      APEX_CMS.save(data);
    }
  }
  if (typeof renderMsgs    === 'function') renderMsgs();
  if (typeof updateMsgBadge === 'function') updateMsgBadge();
};

/* ════════════════════════════════════════════════════════════════
   ADMIN USERS — multi-admin registration / approval system
   (used by admin-portal.html — called from inline script)
   ════════════════════════════════════════════════════════════════ */

/* Save a new admin registration to Supabase */
window.apexRegisterAdmin = async function(username, email, password, fullName) {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: 'Server storage not configured. Contact the super admin.' };
  // Check duplicate
  const { data: existing } = await sb.from(TBL_ADMINS)
    .select('id').or(`username.eq.${username},email.eq.${email}`).limit(1);
  if (existing && existing.length > 0)
    return { ok: false, error: 'An account with this username or email already exists.' };
  const { data, error } = await sb.from(TBL_ADMINS).insert({
    username, email, password, full_name: fullName, role: 'admin', status: 'pending'
  }).select().single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, user: data };
};

/* Find admin by username + password (for login) */
window.apexFindAdmin = async function(username, password) {
  const sb = getSupabase(); if (!sb) return null;
  try {
    const { data } = await sb.from(TBL_ADMINS)
      .select('*').eq('username', username).eq('password', password).single();
    return data || null;
  } catch(e) { return null; }
};

/* Find admin by email (for forgot-password) */
window.apexFindAdminByEmail = async function(email) {
  const sb = getSupabase(); if (!sb) return null;
  try {
    const { data } = await sb.from(TBL_ADMINS)
      .select('*').eq('email', email.toLowerCase().trim()).single();
    return data || null;
  } catch(e) { return null; }
};

/* Update admin password */
window.apexUpdateAdminPassword = async function(id, newPassword) {
  const sb = getSupabase(); if (!sb) return false;
  try {
    const { error } = await sb.from(TBL_ADMINS).update({ password: newPassword }).eq('id', id);
    return !error;
  } catch(e) { return false; }
};

/* Get all pending admins */
window.apexGetPendingAdmins = async function() {
  const sb = getSupabase(); if (!sb) return [];
  try {
    const { data } = await sb.from(TBL_ADMINS)
      .select('*').eq('status', 'pending').order('created_at', { ascending: true });
    return data || [];
  } catch(e) { return []; }
};

/* Get all admins (for management table) */
window.apexGetAllAdmins = async function() {
  const sb = getSupabase(); if (!sb) return [];
  try {
    const { data } = await sb.from(TBL_ADMINS)
      .select('*').order('created_at', { ascending: false });
    return data || [];
  } catch(e) { return []; }
};

/* Approve admin — set role + status=active */
window.apexApproveAdmin = async function(id, role) {
  const sb = getSupabase(); if (!sb) return false;
  try {
    const { error } = await sb.from(TBL_ADMINS)
      .update({ status: 'active', role }).eq('id', id);
    return !error;
  } catch(e) { return false; }
};

/* Change admin role */
window.apexChangeAdminRole = async function(id, role) {
  const sb = getSupabase(); if (!sb) return false;
  try {
    const { error } = await sb.from(TBL_ADMINS).update({ role }).eq('id', id);
    return !error;
  } catch(e) { return false; }
};

/* Suspend / restore */
window.apexSetAdminStatus = async function(id, status) {
  const sb = getSupabase(); if (!sb) return false;
  try {
    const { error } = await sb.from(TBL_ADMINS).update({ status }).eq('id', id);
    return !error;
  } catch(e) { return false; }
};

/* Hard delete */
window.apexDeleteAdmin = async function(id) {
  const sb = getSupabase(); if (!sb) return false;
  try {
    const { error } = await sb.from(TBL_ADMINS).delete().eq('id', id);
    return !error;
  } catch(e) { return false; }
};

/* ════════════════════════════════════════════════════════════════
   EMAIL NOTIFICATIONS
   ════════════════════════════════════════════════════════════════ */

async function apexSendEmail(params) {
  if (typeof emailjs === 'undefined') { console.warn('[APEX] EmailJS not loaded'); return false; }
  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      from_name:  params.from_name  || 'Unknown',
      from_email: params.from_email || '',
      from_org:   params.from_org   || '—',
      phone:      params.phone      || '—',
      country:    params.country    || '—',
      service:    params.service    || '—',
      budget:     params.budget     || '—',
      message:    params.message    || '',
      sent_time: new Date().toLocaleString('en-GB', {
        day:'2-digit', month:'short', year:'numeric',
        hour:'2-digit', minute:'2-digit'
      })
    });
    return true;
  } catch(e) { console.error('[APEX] EmailJS failed:', e); return false; }
}

/* Notify super admin of a new admin registration */
window.apexNotifyAdminRegistration = async function(user) {
  return apexSendEmail({
    from_name:  user.full_name,
    from_email: user.email,
    from_org:   '—',
    phone:      '—',
    service:    'Admin Portal — Access Request',
    message:    'New admin access request for the APEX R&M GROUP Admin Portal.\n\n'
              + 'Username: ' + user.username + '\n'
              + 'Full Name: ' + user.full_name + '\n'
              + 'Email: '    + user.email + '\n\n'
              + 'Log in to the Admin Portal → Admin Users to approve or reject.'
  });
};

/* Send forgot-password email with a new temp password */
window.apexSendForgotPassword = async function(email, tempPassword) {
  return apexSendEmail({
    from_name:  'Admin Portal',
    from_email: email,
    from_org:   '—',
    service:    'Password Reset — Admin Portal',
    message:    'A password reset was requested for your admin account.\n\n'
              + 'Your new temporary password is: ' + tempPassword + '\n\n'
              + 'Log in at: apexrmgroup.com/admin-portal\n'
              + 'Please change your password after logging in.'
  });
};

/* ════════════════════════════════════════════════════════════════
   CONTACT FORM
   ════════════════════════════════════════════════════════════════ */

function apexSaveToLocalStorage(msg) {
  try {
    if (typeof APEX_CMS !== 'undefined' && typeof APEX_CMS.addMessage === 'function') {
      APEX_CMS.addMessage(msg); return true;
    }
  } catch(e) {}
  return false;
}

function apexWireContactForm() {
  const form = document.getElementById('apex-contact-form');
  if (!form) return;
  const fresh = form.cloneNode(true);
  form.parentNode.replaceChild(fresh, form);

  fresh.addEventListener('submit', async function(e) {
    e.preventDefault();
    const get = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
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

    if (!msg.name || !msg.email || !msg.message) {
      _showBanner(fresh, 'error', 'Please fill in all required fields (Name, Email, Project Brief).'); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(msg.email)) {
      _showBanner(fresh, 'error', 'Please enter a valid email address.'); return;
    }

    const btn = fresh.querySelector('button[type="submit"]');
    const orig = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending…'; }

    try {
      /* Save to Supabase (cross-device, primary) */
      const sbOk = await apexSaveToSupabase(msg);
      /* Save to localStorage (same-device fallback if Supabase not set up yet) */
      if (!sbOk) apexSaveToLocalStorage(msg);
      /* Email notification */
      const emailOk = await apexSendEmail({
        from_name: msg.name, from_email: msg.email, from_org: msg.org,
        phone: msg.phone, country: msg.country, service: msg.service,
        budget: msg.budget, message: msg.message
      });

      fresh.parentNode.innerHTML = `
        <div style="text-align:center;padding:3.5rem 2rem;">
          <div style="font-size:3.5rem;margin-bottom:1.25rem;">✅</div>
          <h3 style="font-family:var(--font-heading);color:var(--navy);margin-bottom:0.75rem;">Message Sent Successfully!</h3>
          <p style="color:var(--gray);font-size:0.9rem;line-height:1.6;">
            Thank you, <strong>${_esc(msg.name)}</strong>. We have received your enquiry
            and will respond within <strong>24 business hours</strong>.
          </p>
          ${!emailOk ? '<p style="color:var(--gray);font-size:0.82rem;margin-top:0.75rem;">⚠️ Email confirmation may be delayed — your message has been recorded.</p>' : ''}
          <div style="margin-top:1.5rem;"><a href="index.html" style="color:var(--teal);font-size:0.85rem;">← Back to Home</a></div>
        </div>`;
    } catch(err) {
      console.error('[APEX] Form error:', err);
      if (btn) { btn.disabled = false; btn.innerHTML = orig; }
      _showBanner(fresh, 'error', 'Something went wrong. Please email us directly at info.apexrmgroup@gmail.com');
    }
  });
}

function _showBanner(form, type, text) {
  let b = form.querySelector('.apex-form-banner');
  if (!b) {
    b = document.createElement('div'); b.className = 'apex-form-banner';
    const btn = form.querySelector('button[type="submit"]');
    if (btn) form.insertBefore(b, btn); else form.appendChild(b);
  }
  const err = type === 'error';
  b.style.cssText = `margin-bottom:1rem;padding:.75rem 1rem;border-radius:6px;font-size:.83rem;`
    + `background:${err?'rgba(231,76,60,.08)':'rgba(39,174,96,.08)'};`
    + `border:1px solid ${err?'rgba(231,76,60,.35)':'rgba(39,174,96,.35)'};`
    + `color:${err?'#c0392b':'#1e8449'};`;
  b.textContent = text;
  b.scrollIntoView({ behavior:'smooth', block:'center' });
  setTimeout(() => { if (b.parentNode) b.remove(); }, 6000);
}

function _esc(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ── Auto-init ── */
(function() {
  document.addEventListener('DOMContentLoaded', () => {
    if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY) emailjs.init(EMAILJS_PUBLIC_KEY);
    if (document.getElementById('apex-contact-form')) apexWireContactForm();
  });
})();

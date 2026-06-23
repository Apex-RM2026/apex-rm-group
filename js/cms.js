/* ============================================================
   APEX R&M GROUP — cms.js  v3.0
   Shared CMS Data Layer — Admin ↔ Website Bridge
   ============================================================ */
'use strict';

const APEX_CMS_KEY = 'apex_cms_v3';

/* ── DEFAULT CONTENT (mirrors original HTML exactly) ── */
const APEX_DEFAULTS = {
  global: {
    company_name:     'APEX R&M GROUP Ltd',
    tagline:          'Spatial Intelligence. Strategic Growth.',
    footer_desc:      "Africa's premier spatial consulting firm — empowering governments, organisations, and communities with cutting-edge spatial intelligence and strategic advisory services.",
    address:          'Kigali, Rwanda (HQ)',
    email:            'info.apexrmgroup@gmail.com',
    phone:            '+250 787 523 890',
    whatsapp:         '250787523890',
    copyright:        '© 2025 Apex R&M Group Ltd. All rights reserved. Kigali, Rwanda.',
    social_linkedin:  'https://www.linkedin.com/company/116016508',
    social_twitter:   'https://x.com/ApexRMGroup',
    social_facebook:  'https://web.facebook.com/profile.php?id=61589665884720',
    social_instagram: 'https://www.instagram.com/apexrmgroup/',
    social_youtube:   'https://www.youtube.com/@ApexRMGroup'
  },

  home: {
    hero_badge:     'Kigali, Rwanda • African • Global',
    hero_title1:    'Where',
    hero_highlight: 'Spatial Intelligence',
    hero_title2:    'Meets Strategic Growth.',
    hero_sub:       'Precision consulting in GIS, land management, environmental advisory, and infrastructure planning across Africa and beyond.',
    hero_btn1_text: 'Explore Services',
    hero_btn1_link: 'services.html',
    hero_btn2_text: 'Request Consultation',
    hero_btn2_link: 'contact.html',
    hero_image:     'Images/Home/Line 80 Spong Kigali.jpg',
    stat1_num:'50', stat1_suffix:'+', stat1_label:'Projects Completed',
    stat2_num:'10', stat2_suffix:'+', stat2_label:'Countries Served',
    stat3_num:'30', stat3_suffix:'+', stat3_label:'Expert Consultants',
    stat4_num:'15', stat4_suffix:'+', stat4_label:'Years Combined Experience',
    why_label:    'Why Choose Us',
    why_title1:   'Built for Africa.',
    why_title2:   'Trusted Globally.',
    why_subtitle: 'We combine world-class technical expertise with deep local knowledge — delivering spatial solutions that are both rigorous and contextually grounded.',
    why_image:    'Images/Home/H Line 191 word.avif',
    cta_title1:   'Ready to work with us?',
    cta_title2:   "Let's map your future.",
    cta_sub:      'We respond to all enquiries within 24 business hours.',
    cta_btn1_text:'Contact Us Today',   cta_btn1_link:'contact.html',
    cta_btn2_text:'+250 787 523 890',  cta_btn2_link:'tel:+250787523890',
    clients:['Rwanda MINIRENA','World Bank Group','UNDP Africa','African Development Bank','GIZ Rwanda','UN-Habitat','USAID'],
    services:[
      {icon:'🗺️',num:'01',title:'GIS & Spatial Analysis',     desc:'Custom mapping, geodatabase design, WebGIS development, and multi-criteria decision analysis for planning and investment.', link:'services.html#gis'},
      {icon:'🛰️',num:'02',title:'Remote Sensing & EO',         desc:'Satellite imagery processing, UAV/drone surveys, land use mapping, change detection, and vegetation index monitoring.',       link:'services.html#remote-sensing'},
      {icon:'📋',num:'03',title:'Land Administration',          desc:'Land tenure systems, cadastral surveys, land registration, conflict resolution, and governance policy advisory.',           link:'services.html#land-admin'},
      {icon:'🌿',num:'04',title:'Environmental Consulting',     desc:'EIAs, Strategic Environmental Assessments, biodiversity surveys, climate risk mapping, and carbon project advisory.',       link:'services.html#environment'},
      {icon:'🏗️',num:'05',title:'Infrastructure Planning',      desc:'Site suitability analysis, utility network planning, transport corridor mapping, and spatial master plan production.',     link:'services.html#infrastructure'},
      {icon:'🎓',num:'06',title:'Capacity Building',            desc:'GIS training for institutions, QGIS/ArcGIS workshops, curriculum design, and embedded technical advisory.',                link:'services.html#capacity'}
    ],
    blog:[
      {img:'Images/Home/1 land managimate map.png', cat:'GIS & Technology', date:'May 2025',
       title:'How GIS Is Transforming Land Administration in East Africa',
       excerpt:'Digital land registries, satellite cadastres, and open spatial data portals are reshaping tenure security across the region.', link:'insights.html'},
      {img:'Images/Home/H Environment line 339.png', cat:'Environment', date:'April 2025',
       title:'Remote Sensing for Climate Resilience: Lessons from East Africa',
       excerpt:'How Earth observation data is enabling earlier responses to drought, flood, and deforestation across the continent.', link:'insights.html'},
      {img:'Images/Home/H Urban Planning Line 351.avif', cat:'Urban Planning', date:'March 2025',
       title:'Smart Cities in Africa: The Role of Spatial Data Infrastructure',
       excerpt:"Building the geospatial foundations that will power Africa's next generation of urban centres.", link:'insights.html'}
    ]
  },

  about: {
    hero_title:'About Apex R&M Group',
    hero_sub:'A premier spatial consulting firm founded on the conviction that spatial intelligence is the backbone of sustainable development across Africa and the world.',
    story_title:'Born from a Vision to Transform Africa Through Spatial Intelligence',
    story_p1:"Apex R&M Group was founded in 2025 by a team of seasoned spatial analysts and environmental consultants who recognised a critical gap: the need for a truly African spatial consulting firm that could match international technical standards with genuine local expertise.",
    story_p2:"Operating from Kigali, Rwanda — one of Africa's most dynamic innovation hubs — we bring together multidisciplinary expertise in GIS, remote sensing, land management, environmental consulting, and infrastructure planning.",
    story_p3:"Today, Apex R&M Group works with governments, development banks, NGOs, and private sector clients across East, Central, and West Africa. Our commitment: deliver spatial intelligence that drives real, measurable, lasting impact.",
    story_image:'Images/About/A About image section.jpg',
    mission:"To empower governments, organizations, and communities with cutting-edge spatial intelligence, resource management expertise, and strategic advisory services — driving sustainable planning and development, evidence-based decision-making, and measurable impact across Africa and the world.",
    vision:"To be Africa's most trusted and innovative spatial consulting group — recognized globally for transforming complex geographic and resource challenges into powerful opportunities for growth, governance, and lasting prosperity.",
    values:[
      {icon:'⭐',title:'Excellence',    desc:'We pursue the highest technical and professional standards in every deliverable, every engagement, every interaction.'},
      {icon:'🤝',title:'Integrity',     desc:'We are transparent, honest, and ethical — with clients, partners, and ourselves. Our word is our commitment.'},
      {icon:'💡',title:'Innovation',    desc:"We embrace emerging technologies and methodologies to solve Africa's spatial challenges in new and better ways."},
      {icon:'🎯',title:'Impact',        desc:'We measure success not just by deliverables, but by the real, lasting change our work creates on the ground.'},
      {icon:'🔗',title:'Collaboration', desc:'We work with, not for our clients — building local capacity and co-creating solutions that outlast our engagement.'},
      {icon:'🌱',title:'Sustainability',desc:'Environmental responsibility and social equity are embedded in how we operate and in what we recommend.'}
    ],
    csr_stat1_num:'40%', csr_stat1_label:'Women on Team',
    csr_stat2_num:'3',   csr_stat2_label:'University Partnerships',
    csr_stat3_num:'100%',csr_stat3_label:'African-Led Leadership'
  },
  projects:[
    {id:1,category:'gis',       tag:'GIS + Remote Sensing', location:'Rwanda',       year:'2024',
     title:'National Land Use Mapping — Rwanda',
     client:'Ministry of Lands',  duration:'6 months', scale:'14,000 km²',
     image:'Images/Home/1 land managimate map.png',
     desc:"Comprehensive LULC classification for Rwanda's national spatial planning framework using Sentinel-2 satellite imagery with ground-truth validation.",
     impact:'National spatial database delivered. 14,000 km² classified into 12 LULC categories. Adopted for Rwanda\'s national land use masterplan.'},
    {id:2,category:'environment',tag:'EIA + Biodiversity',   location:'DR Congo',     year:'2024',
     title:'Mining Corridor Environmental Impact Assessment',
     client:'Private Mining Co.', duration:'9 months', scale:'3 international reports',
     image:'Images/Home/H Environment line 339.png',
     desc:'Full EIA and biodiversity baseline study for a major mining corridor in eastern DRC, meeting IFC Performance Standards and Equator Principles.',
     impact:'3 internationally compliant reports. Biodiversity database established. Project received environmental clearance.'},
    {id:3,category:'urban',      tag:'Urban Planning GIS',   location:'Rwanda (Kigali)',year:'2025',
     title:'Urban Growth Modelling — Kigali City',
     client:'Kigali City Council',duration:'4 months', scale:'2050 projections',
     image:'Images/Home/H Urban Planning Line 351.avif',
     desc:"Spatial urban growth modelling providing master plan inputs for Kigali's 2050 urban development framework including cellular automata modelling and scenario analysis.",
     impact:'3 growth scenarios modelled to 2050. Master plan inputs delivered. Adopted by City Council planning department.'},
  ],

  sectors:[
    {id:'government',   icon:'🏛️',title:'Government & Public Administration',desc:'Spatial planning support, national cadastres, e-governance GIS, and decentralisation mapping.',               use_cases:['National spatial data infrastructure (NSDI) development','District boundary and administrative mapping','E-governance GIS portal development','Decentralisation and devolution spatial analysis','National development plan spatial indicators']},
    {id:'agriculture',  icon:'🌾',title:'Agriculture & Food Security',          desc:'Crop monitoring, precision agriculture mapping, irrigation planning, and food security analysis.',        use_cases:['Crop type and health monitoring via remote sensing','Irrigation suitability and water resource mapping','Smallholder land tenure and farm boundary mapping','Food insecurity and vulnerability spatial analysis','Agricultural value chain spatial mapping']},
    {id:'mining',       icon:'⛏️',title:'Mining & Extractives',                 desc:'Concession mapping, environmental compliance GIS, and artisanal mining data management.',               use_cases:['Mining concession boundary mapping and management','Environmental compliance and monitoring GIS','Artisanal and small-scale mining (ASM) data management','Conflict minerals spatial risk mapping','Post-mining land rehabilitation mapping']},
    {id:'urban',        icon:'🏙️',title:'Urban Development & Real Estate',      desc:'Smart city GIS, housing demand mapping, informal settlement upgrading, and utility network design.', use_cases:['Urban growth modelling and scenario planning','Informal settlement mapping and upgrading','Housing demand and affordability spatial analysis','Smart city sensor data integration and mapping','Real estate market spatial analysis']},
    {id:'energy',       icon:'⚡',title:'Energy & Utilities',                   desc:'Solar/wind suitability mapping, power grid planning, and electrification access mapping.',             use_cases:['Solar irradiance and wind resource spatial analysis','Rural electrification access gap mapping','Transmission line corridor routing and siting','Energy demand mapping and load forecasting GIS','Hydropower site suitability and impact assessment']},
    {id:'conservation', icon:'🦁',title:'Conservation & Natural Resources',      desc:'Protected area management, biodiversity mapping, REDD+ spatial analysis, and national park planning.', use_cases:['Protected area boundary mapping and management','Biodiversity baseline and species distribution mapping','REDD+ carbon stock spatial analysis','Wildlife corridor and connectivity mapping','Community conservation area boundary demarcation']},
    {id:'humanitarian', icon:'🤝',title:'Humanitarian & International Development',desc:'Displacement mapping, rapid needs assessment, and health facility access analysis.',                 use_cases:['Displacement and refugee settlement mapping','Humanitarian needs assessment spatial analysis','Health facility catchment area and access mapping','Crisis GIS and emergency response mapping','Development project impact area mapping']},
    {id:'finance',      icon:'💰',title:'Finance & Insurance',                   desc:'Spatial risk modelling, property valuation GIS, agricultural insurance mapping.',                     use_cases:['Property valuation and real estate GIS','Agricultural insurance crop loss mapping','Flood and climate risk modelling for insurance','Financial services access and inclusion mapping','Microfinance portfolio spatial risk analysis']}
  ],

  advisors:[
    {initials:'',name:'Prof. Peter Kariuki',title:'Technical Advisor — Land Administration',
     bio:'Emeritus Professor of Land Administration at Nairobi University. 30+ years of experience in African land policy reform. Previously Technical Lead for the World Bank Kenya Land Programme.'},
    {initials:'',name:'Dr. Sophie Chen',title:'International Advisor — Environmental Standards',
     bio:'Environmental compliance specialist with IEMA Fellowship. 20 years advising development finance institutions on environmental standards for African infrastructure projects.'},
    {initials:'',name:'Dr. Moussa Ouedraogo',title:'Regional Advisor — West & Central Africa',
     bio:"Former Director, African Development Bank Environmental and Social Standards Division. Deep network across francophone Africa and multilateral development institutions."},
    {initials:'',name:'Rehema Njoroge',title:'Business & Strategy Advisor',
     bio:'Managing Director, East Africa Consulting Group. Former McKinsey principal. Specialist in African market strategy, partnership development, and institutional client management.'}
  ],

  contact:{
    hero_title:"Get In Touch — Let's Start Mapping Your Success",
    hero_sub:'We respond to all enquiries within 24 business hours. Our team speaks English, French, and Kinyarwanda.',
    address1:'Kigali, Rwanda',
    address2:'KG 123 St, Kimihurura, Gasabo District',
    email_general:'info.apexrmgroup@gmail.com',
    email_bd:'bd.apexrmgroup@gmail.com',
    phone:'+250 787 523 890',
    whatsapp:'250787523890',
    languages:'English • Français • Ikinyarwanda',
    map_lat:-1.9441, map_lng:30.0619, map_zoom:13,
    faqs:[
      {q:'What types of organisations do you work with?',
       a:"We work with government ministries, local authorities, international development organisations (World Bank, UNDP, GIZ, USAID), NGOs, private sector companies, and academic institutions across Africa and beyond."},
      {q:'What is your typical project timeline?',
       a:'Project timelines vary by scope. Small assessments typically take 4–8 weeks. National-scale mapping or EIA projects usually run 3–9 months. We provide detailed timelines in all project proposals.'},
      {q:'Do you work outside of Rwanda?',
       a:'Yes. While headquartered in Kigali, we have delivered projects in over 10 countries across East, Central, and West Africa. We have networks of associate consultants in Kenya, Uganda, Tanzania, DRC, and Senegal.'},
      {q:'Can you provide a quote or proposal?',
       a:'Absolutely. Send us a project brief via the contact form or email bd@apexrmgroup.com and we will respond within 48 hours with initial questions and a timeline for a full proposal.'},
      {q:'What GIS software do you use?',
       a:'We are proficient in QGIS, Esri ArcGIS, Google Earth Engine, ERDAS IMAGINE, ENVI, AutoCAD, and a range of open-source geospatial tools. We also develop custom WebGIS solutions.'},
      {q:'Do you offer GIS training?',
       a:'Yes — capacity building is one of our core service lines. We design and deliver tailored GIS training programmes for government agencies, universities, and private sector teams across Africa.'}
    ]
  },

  messages:[]
};

/* ── CORE CMS API ── */
const APEX_CMS = {
  load() {
    try {
      const saved = JSON.parse(localStorage.getItem(APEX_CMS_KEY) || '{}');
      return this._deepMerge(JSON.parse(JSON.stringify(APEX_DEFAULTS)), saved);
    } catch(e) { return JSON.parse(JSON.stringify(APEX_DEFAULTS)); }
  },
  save(data) { localStorage.setItem(APEX_CMS_KEY, JSON.stringify(data)); },
  get(section) { return this.load()[section]; },
  set(section, value) { const d=this.load(); d[section]=value; this.save(d); },
  setKey(section, key, value) { const d=this.load(); if(!d[section])d[section]={}; d[section][key]=value; this.save(d); },
  getMessages() { return this.load().messages||[]; },
  addMessage(msg) {
    const d=this.load();
    if(!d.messages)d.messages=[];
    d.messages.unshift({...msg, id:Date.now(), read:false, time:new Date().toLocaleString()});
    this.save(d);
    return true;
  },
  _deepMerge(def, saved) {
    const r = Object.assign({}, def);
    for (const k in saved) {
      if (saved[k]!==null && typeof saved[k]==='object' && !Array.isArray(saved[k]) && def[k] && typeof def[k]==='object' && !Array.isArray(def[k]))
        r[k] = this._deepMerge(def[k], saved[k]);
      else if (saved[k]!==undefined && saved[k]!==null)
        r[k] = saved[k];
    }
    return r;
  }
};

/* ── RENDERER ── */
const ApexRenderer = {
  init() {
    //const data = APEX_CMS.load();
    //this.renderGlobal(data.global);
    //const p = (window.location.pathname.split('/').pop()||'index.html');
    if (!p||p==='index.html') this.renderHome(data.home);
    else if (p==='about.html')    this.renderAbout(data.about);
    else if (p==='services.html') this.renderServices(data.services);
    else if (p==='projects.html') this.renderProjects(data.projects);
    else if (p==='sectors.html')  this.renderSectors(data.sectors);
    else if (p==='team.html')     this.renderTeam(data.team, data.advisors);
    else if (p==='contact.html')  this.renderContact(data.contact);
    this.wireContactForm();
  },

  $: (sel) => document.querySelector(sel),
  $$: (sel) => document.querySelectorAll(sel),
  setText(sel, val) { const e=document.querySelector(sel); if(e&&val!=null) e.textContent=val; },
  setHTML(sel, val) { const e=document.querySelector(sel); if(e&&val!=null) e.innerHTML=val; },
  setAttr(sel, attr, val) { const e=document.querySelector(sel); if(e&&val) e.setAttribute(attr,val); },

  renderGlobal(g) {
    if(!g) return;
    const fd=document.querySelector('.footer-desc');
    if(fd) fd.textContent=g.footer_desc;
    // Footer contact items
    const fi=document.querySelectorAll('.footer-contact-item');
    if(fi[0]){ const s=fi[0].querySelector('span'); if(s) s.textContent=g.address; }
    if(fi[1]){ const a=fi[1].querySelector('a'); if(a){a.textContent=g.email; a.href='mailto:'+g.email;} }
    if(fi[2]){ const a=fi[2].querySelector('a'); if(a){a.textContent=g.phone; a.href='tel:'+g.phone.replace(/\s/g,'');} }
    if(fi[3]){ const a=fi[3].querySelector('a'); if(a) a.href='https://wa.me/'+g.whatsapp; }
    // Social icons
    const socials=document.querySelectorAll('.footer-social .social-icon');
    [g.social_linkedin,g.social_twitter,g.social_facebook,g.social_instagram,g.social_youtube].forEach((url,i)=>{ if(socials[i]&&url) socials[i].href=url; });
    const cb=document.querySelector('.footer-bottom p');
    if(cb) cb.textContent=g.copyright;
    const wa=document.getElementById('whatsapp-btn');
    if(wa&&g.whatsapp) wa.href='https://wa.me/'+g.whatsapp;
  },

  renderHome(h) {
    if(!h) return;
    // Hero
    const badge=document.querySelector('.hero-badge');
    if(badge) badge.innerHTML=`<i class="fa-solid fa-location-dot"></i> ${h.hero_badge}`;
    const h1=document.querySelector('.hero h1');
    if(h1) h1.innerHTML=`${h.hero_title1} <span class="gold">${h.hero_highlight}</span><br>${h.hero_title2}`;
    const sub=document.querySelector('.hero-sub');
    if(sub) sub.textContent=h.hero_sub;
    const btns=document.querySelectorAll('.hero-btns a');
    if(btns[0]){btns[0].innerHTML=`<i class="fa-solid fa-layer-group"></i> ${h.hero_btn1_text}`;btns[0].href=h.hero_btn1_link;}
    if(btns[1]){btns[1].innerHTML=`<i class="fa-solid fa-calendar-check"></i> ${h.hero_btn2_text}`;btns[1].href=h.hero_btn2_link;}
    const heroBg=document.querySelector('.hero-bg');
    if(heroBg&&h.hero_image) heroBg.style.backgroundImage=`url('${h.hero_image}')`;
    // Stats
    const sn=document.querySelectorAll('.stat-number [data-count]');
    const sl=document.querySelectorAll('.stat-label');
    [[h.stat1_num,h.stat1_label],[h.stat2_num,h.stat2_label],[h.stat3_num,h.stat3_label],[h.stat4_num,h.stat4_label]].forEach(([n,l],i)=>{
      if(sn[i]) sn[i].setAttribute('data-count',n);
      if(sl[i]) sl[i].textContent=l;
    });
    // Services grid
    if(h.services){
      const cards=document.querySelectorAll('.services-grid .service-card');
      h.services.forEach((s,i)=>{
        if(!cards[i]) return;
        const ico=cards[i].querySelector('.service-icon');
        const num=cards[i].querySelector('.service-num');
        const ttl=cards[i].querySelector('h3');
        const dsc=cards[i].querySelector('p');
        const lnk=cards[i].querySelector('.service-link')||cards[i];
        if(ico) ico.textContent=s.icon;
        if(num) num.textContent=s.num;
        if(ttl) ttl.textContent=s.title;
        if(dsc) dsc.textContent=s.desc;
        if(lnk&&lnk.tagName==='A') lnk.href=s.link;
      });
    }
    // Why section
    const wl=document.querySelector('.why-section .section-label');
    const wt=document.querySelector('.why-section .section-title');
    const ws=document.querySelector('.why-section .section-subtitle');
    const wi=document.querySelector('.why-image img');
    if(wl) wl.textContent=h.why_label;
    if(wt) wt.innerHTML=`${h.why_title1}<br>${h.why_title2}`;
    if(ws) ws.textContent=h.why_subtitle;
    if(wi&&h.why_image) wi.src=h.why_image;
    // Clients
    if(h.clients){
      const ce=document.querySelectorAll('.client-logo-item');
      h.clients.forEach((c,i)=>{ if(ce[i]) ce[i].textContent=c; });
    }
    // Testimonials
    if(h.testimonials){
      const slides=document.querySelectorAll('.testimonial-slide');
      h.testimonials.forEach((t,i)=>{
        if(!slides[i]) return;
        const q=slides[i].querySelector('.testimonial-quote');
        const av=slides[i].querySelector('.testimonial-avatar');
        const nm=slides[i].querySelector('.name');
        const rl=slides[i].querySelector('.role');
        const st=slides[i].querySelector('.testimonial-stars');
        if(q)  q.textContent=`"${t.quote}"`;
        if(av) av.textContent=t.initials;
        if(nm) nm.textContent=t.name;
        if(rl) rl.textContent=t.role;
        if(st) st.textContent='★'.repeat(t.stars||5);
      });
    }
    // Blog
    if(h.blog){
      const cards=document.querySelectorAll('.blog-grid .blog-card');
      h.blog.forEach((b,i)=>{
        if(!cards[i]) return;
        const img=cards[i].querySelector('.blog-image img');
        const cat=cards[i].querySelector('.blog-category');
        const dt=cards[i].querySelector('.blog-date');
        const ttl=cards[i].querySelector('h3');
        const dsc=cards[i].querySelector('p');
        const lnk=cards[i].querySelector('.blog-read-more');
        if(img){img.src=b.img;img.alt=b.title;}
        if(cat) cat.textContent=b.cat;
        if(dt)  dt.textContent=b.date;
        if(ttl) ttl.textContent=b.title;
        if(dsc) dsc.textContent=b.excerpt;
        if(lnk) lnk.href=b.link;
      });
    }
    // CTA strip
    const ch2=document.querySelector('.cta-strip h2');
    if(ch2) ch2.innerHTML=`${h.cta_title1}<br><em>${h.cta_title2}</em>`;
    const csub=document.querySelector('.cta-strip p');
    if(csub) csub.textContent=h.cta_sub;
    const cbtns=document.querySelectorAll('.cta-strip-actions a');
    if(cbtns[0]){cbtns[0].innerHTML=`<i class="fa-solid fa-paper-plane"></i> ${h.cta_btn1_text}`;cbtns[0].href=h.cta_btn1_link;}
    if(cbtns[1]){cbtns[1].innerHTML=`<i class="fa-solid fa-phone"></i> ${h.cta_btn2_text}`;cbtns[1].href=h.cta_btn2_link;}
  },

  renderAbout(a) {
    if(!a) return;
    const heroH1=document.querySelector('.page-hero h1');
    if(heroH1) heroH1.textContent=a.hero_title;
    // Mission/Vision blockquotes
    const bqs=document.querySelectorAll('blockquote');
    if(bqs[0]) bqs[0].textContent=`"${a.mission}"`;
    if(bqs[1]) bqs[1].textContent=`"${a.vision}"`;
    // Values cards
    if(a.values){
      const vc=document.querySelectorAll('.value-card');
      a.values.forEach((v,i)=>{
        if(!vc[i]) return;
        const ic=vc[i].querySelector('.value-icon');
        const tt=vc[i].querySelector('h3');
        const dc=vc[i].querySelector('p');
        if(ic) ic.textContent=v.icon;
        if(tt) tt.textContent=v.title;
        if(dc) dc.textContent=v.desc;
      });
    }
  },

  renderServices(services) {
    if(!services) return;
    services.forEach(s=>{
      const sec=document.getElementById(s.id);
      if(!sec) return;
      const ttl=sec.querySelector('h2');
      const sub=sec.querySelector('.section-label');
      const dsc=sec.querySelector('.service-detail-content p');
      const img=sec.querySelector('img');
      if(ttl) ttl.textContent=s.title;
      if(sub) sub.textContent=s.subtitle||'';
      if(dsc) dsc.textContent=s.desc;
      if(img&&s.image) img.src=s.image;
      const dels=sec.querySelectorAll('.deliverable-item');
      s.deliverables.forEach((d,i)=>{ if(dels[i]) dels[i].innerHTML=`<i class="fa-solid fa-check"></i> ${d}`; });
      const tgs=sec.querySelectorAll('.industry-tag');
      s.tags.forEach((t,i)=>{ if(tgs[i]) tgs[i].textContent=t; });
    });
    // Overview grid
    const ov=document.querySelectorAll('.services-grid .service-card');
    services.forEach((s,i)=>{
      if(!ov[i]) return;
      const ic=ov[i].querySelector('.service-icon');
      const nm=ov[i].querySelector('.service-num');
      const tt=ov[i].querySelector('h3');
      const dc=ov[i].querySelector('p');
      if(ic) ic.textContent=s.icon;
      if(nm) nm.textContent=s.num;
      if(tt) tt.textContent=s.title;
      if(dc) dc.textContent=s.desc;
    });
  },

  renderProjects(projects) {
    if(!projects) return;
    const grid=document.querySelector('.projects-grid');
    if(!grid) return;
    grid.innerHTML=projects.map((p,i)=>`
      <div class="project-full-card reveal" data-delay="${(i%3+1)*100}" data-category="${p.category}">
        <div class="project-image">
          <img src="${p.image}" alt="${p.title}" loading="lazy">
          <div class="project-tag">${p.tag}</div>
        </div>
        <div class="project-body">
          <div class="project-meta"><span>${p.location}</span> &bull; <span>${p.year}</span></div>
          <h3>${p.title}</h3>
          <div class="case-study-meta">
            <div class="case-meta-item"><i class="fa-solid fa-building-columns"></i> ${p.client}</div>
            <div class="case-meta-item"><i class="fa-solid fa-clock"></i> ${p.duration}</div>
            <div class="case-meta-item"><i class="fa-solid fa-map"></i> ${p.scale}</div>
          </div>
          <p>${p.desc}</p>
          <div style="margin-top:1rem;padding-top:1rem;border-top:1px solid rgba(10,22,40,0.08);">
            <div style="font-family:var(--font-ui);font-size:0.68rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--gold);margin-bottom:0.6rem;">Impact</div>
            <p style="font-size:0.82rem;color:var(--gray);">${p.impact}</p>
          </div>
        </div>
      </div>`).join('');
  },

  renderSectors(sectors) {
    if(!sectors) return;
    sectors.forEach(s=>{
      const sec=document.getElementById(s.id);
      if(!sec) return;
      const ttl=sec.querySelector('h2');
      const dsc=sec.querySelector('p');
      const ico=sec.querySelector('.sector-detail-icon');
      if(ttl) ttl.textContent=s.title;
      if(dsc) dsc.textContent=s.desc;
      if(ico) ico.textContent=s.icon;
      sec.querySelectorAll('li').forEach((li,i)=>{ if(s.use_cases[i]) li.textContent=s.use_cases[i]; });
    });
    document.querySelectorAll('.sector-overview-card, .sectors-grid .sector-card').forEach((card,i)=>{
      if(!sectors[i]) return;
      const ic=card.querySelector('.sector-icon,.icon');
      const tt=card.querySelector('h3,h4');
      const dc=card.querySelector('p');
      if(ic) ic.textContent=sectors[i].icon;
      if(tt) tt.textContent=sectors[i].title;
      if(dc) dc.textContent=sectors[i].desc;
    });
  },

  renderContact(c) {
    if(!c) return;
    const heroH1=document.querySelector('.page-hero h1');
    if(heroH1) heroH1.textContent=c.hero_title;
    // Contact info items (index 0=address, 1=email general, 2=email BD, 3=phone, 4=whatsapp, 5=languages)
    const items=document.querySelectorAll('.contact-info-item');
    if(items[0]){const p=items[0].querySelector('p'); if(p) p.innerHTML=`${c.address1}<br><span style="font-size:0.82rem;color:var(--gray);">${c.address2}</span>`;}
    if(items[1]){const a=items[1].querySelector('a'); if(a){a.textContent=c.email_general;a.href='mailto:'+c.email_general;}}
    if(items[2]){const a=items[2].querySelector('a'); if(a){a.textContent=c.email_bd||c.email_general;a.href='mailto:'+(c.email_bd||c.email_general);}}
    if(items[3]){const a=items[3].querySelector('a'); if(a){a.textContent=c.phone;a.href='tel:'+c.phone.replace(/\s/g,'');}}
    if(items[4]){const a=items[4].querySelector('a'); if(a) a.href='https://wa.me/'+c.whatsapp;}
    // FAQ accordion
    if(c.faqs){
      const faqItems=document.querySelectorAll('.faq-item');
      c.faqs.forEach((f,i)=>{
        if(!faqItems[i]) return;
        const q=faqItems[i].querySelector('.faq-question');
        const a=faqItems[i].querySelector('.faq-answer');
        if(q) q.textContent=f.q;
        if(a) a.textContent=f.a;
      });
    }
  },

  /* Wire up contact form to save messages into CMS */
  wireContactForm() {
    const form=document.querySelector('.contact-form');
    if(!form) return;
    form.addEventListener('submit', e=>{
      e.preventDefault();
      const get=id=>{ const el=document.getElementById(id); return el?el.value:''; };
      const msg={
        name:        get('full-name'),
        org:         get('organisation'),
        email:       get('email'),
        phone:       get('phone'),
        country:     get('country'),
        service:     get('service'),
        message:     get('brief'),
        subject:     `Website enquiry — ${get('service')||'General'}`
      };
      if(!msg.name||!msg.email||!msg.message){
        alert('Please fill in all required fields.'); return;
      }
      APEX_CMS.addMessage(msg);
      // Show success
      form.innerHTML=`<div style="text-align:center;padding:3rem 2rem;">
        <div style="font-size:3rem;margin-bottom:1rem;">✅</div>
        <h3 style="font-family:var(--font-heading);color:var(--navy);margin-bottom:0.75rem;">Message Sent Successfully!</h3>
        <p style="color:var(--gray);font-size:0.9rem;">Thank you, ${msg.name}. We'll respond within 24 business hours.</p>
        <p style="color:var(--gray);font-size:0.85rem;margin-top:0.5rem;">A copy of your enquiry has been recorded.</p>
      </div>`;
    });
  }
};

/* Auto-init */
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>ApexRenderer.init());
else ApexRenderer.init();

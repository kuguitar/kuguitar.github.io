/* 고려대학교 고전기타부 — shared header/footer + helpers */
(function () {
  'use strict';

  var LINKS = {
    youtube: 'https://www.youtube.com/@kuguitarcom',
    instagram: 'https://www.instagram.com/ku_classicguitar/',
    band: 'https://band.us/band/9556389'
  };

  var NAV = [
    { href: 'about/', label: '소개' },
    { href: 'concerts/', label: '연주회기록' },
    { href: 'students/', label: '재학생' },   // 추후 stu.kuguitar.com
    { href: 'alumni/', label: '교우회' },     // 추후 alum.kuguitar.com
    { href: 'rules/', label: '회칙' }
  ];

  var ICON = {
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15a1 1 0 0 0 1.5.9l12-7.5a1 1 0 0 0 0-1.8l-12-7.5A1 1 0 0 0 7 4.5z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.8 15.1V8.9L15.5 12l-5.7 3.1z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
    band: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14a6.5 6.5 0 0 1 3.5 6"/></svg>',
    file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" stroke-width="1.6"/><path d="M8 12.5l2.6 2.5L16 9.5"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>'
  };

  /* ---------- theme ---------- */
  function storedTheme() {
    try { return localStorage.getItem('kug-theme'); } catch (e) { return null; }
  }
  function applyTheme(t) {
    if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
    else document.documentElement.removeAttribute('data-theme');
  }
  function effectiveTheme() {
    var t = document.documentElement.getAttribute('data-theme');
    if (t) return t;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  applyTheme(storedTheme());

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmtDate(iso, opts) {
    if (!iso) return '';
    var p = iso.split('-');
    if (opts === 'short') return p[0] + '.' + p[1] + '.' + p[2];
    return Number(p[0]) + '년 ' + Number(p[1]) + '월 ' + Number(p[2]) + '일';
  }
  function titleOf(c) {
    // "08회 정기연주회 (’81)" → "8회 정기연주회 (’81)"
    return c.title.replace(/^0(\d)/, '$1').replace(/_/g, ' ').replace(/\s*\*\s*/, ' · ').replace(/\s+/g, ' ').trim();
  }
  function typeLabel(t) {
    return { '정기': '정기연주회', '신입': '신입생환영연주회', '교우': '교우연주회', 'ETC': '그외 연주회' }[t] || t;
  }
  function youtubeEmbed(url) {
    if (!url) return null;
    try {
      var u = new URL(url);
      var list = u.searchParams.get('list');
      var v = u.searchParams.get('v') || (u.hostname === 'youtu.be' ? u.pathname.slice(1) : null);
      if (v) return 'https://www.youtube-nocookie.com/embed/' + v + (list ? '?list=' + list : '');
      if (list) return 'https://www.youtube-nocookie.com/embed/videoseries?list=' + list;
    } catch (e) {}
    return null;
  }
  // 포스터가 없거나 파일을 못 불러오면 연도·제목 카드가 대신 보입니다.
  function posterMedia(c, lazy) {
    var title = titleOf(c);
    var fallback = '<div class="poster-fallback" aria-hidden="true"><span class="pf-year">' + esc((c.date || '').slice(0, 4)) + '</span><span class="pf-title">' + esc(title) + '</span></div>';
    if (!c.poster) return fallback;
    return fallback + '<img src="' + esc(c.poster) + '" alt="' + esc(title) + ' 포스터"' + (lazy ? ' loading="lazy" decoding="async"' : '') + ' onerror="this.remove()">';
  }
  function posterCard(c, extra) {
    var title = titleOf(c);
    var media = posterMedia(c, true);
    var href = c.slug ? 'concert/' + c.slug + '/' : 'concert.html?id=' + esc(c.id);
    return '<a class="poster-card" href="' + href + '">' +
      '<div class="poster-frame">' + media + (c.video ? '<span class="play" title="공연 영상 있음">' + ICON.play + '</span>' : '') + '</div>' +
      '<div class="poster-meta"><h3>' + esc(title) + '</h3>' +
      '<div class="sub"><span class="badge" data-type="' + esc(c.type) + '">' + esc(c.type === 'ETC' ? '그외' : c.type) + '</span>' +
      '<span>' + esc(fmtDate(c.date, 'short')) + '</span></div>' + (extra || '') + '</div></a>';
  }

  /* ---------- yearly data ----------
     data/years/<연도>.js 파일마다 KUG.addYear({...})를 호출합니다.
     목록 파일 없이 FIRST_YEAR부터 (올해 + 1)까지 있는 파일을 모두 불러오므로,
     새해에는 data/years/<새 연도>.js 파일만 추가하면 됩니다. */
  var FIRST_YEAR = 1974;
  var DATA_BASE = (document.currentScript && document.currentScript.src || '').replace(/js\/site\.js(\?.*)?$/, '') + 'data/years/';
  var yearEntries = [];
  var loading = null;

  function addYear(y) { yearEntries.push(y); }

  function parsePerson(s) {
    var m = String(s).match(/^(.+?)\s*\((.+)\)\s*$/);
    return m ? { name: m[1], dept: m[2] } : { name: String(s).trim(), dept: '' };
  }

  function buildDb() {
    var years = yearEntries.slice().sort(function (a, b) { return a.year - b.year; });
    var db = { concerts: [], officers: [], notices: [], history: [], alumniPresidents: [] };
    var apIndex = {};
    years.forEach(function (y) {
      (y.concerts || []).forEach(function (c) { db.concerts.push(c); });
      (y.notices || []).forEach(function (n) { db.notices.push(n); });
      if (y.history && y.history.length) db.history.push({ year: y.year, items: y.history });
      if (y.officers) {
        db.officers.push({
          year: y.year, gen: y.officers.gen,
          president: (y.officers.president || []).map(parsePerson),
          vice: (y.officers.vice || []).map(parsePerson),
          treasurer: (y.officers.treasurer || []).map(parsePerson)
        });
      }
      if (y.alumniPresident) {
        var ap = y.alumniPresident, yy = '’' + String(y.year).slice(2);
        if (apIndex[ap.name]) apIndex[ap.name].years.push(yy);
        else { apIndex[ap.name] = { name: ap.name, gen: ap.gen || '', years: [yy] }; db.alumniPresidents.push(apIndex[ap.name]); }
      }
    });
    db.alumniPresidents.forEach(function (p) { p.years = p.years.join(', '); });
    var byDateDesc = function (a, b) { return (b.date || '').localeCompare(a.date || ''); };
    db.concerts.sort(byDateDesc);
    db.notices.sort(byDateDesc);
    db.officers.reverse();
    return db;
  }

  function load() {
    if (loading) return loading;
    var last = new Date().getFullYear() + 1, jobs = [];
    for (var y = FIRST_YEAR; y <= last; y++) {
      jobs.push(new Promise(function (resolve) {
        var s = document.createElement('script');
        s.src = DATA_BASE + y + '.js';
        s.onload = s.onerror = function () { s.remove(); resolve(); };
        document.head.appendChild(s);
      }));
    }
    loading = Promise.all(jobs).then(buildDb);
    return loading;
  }

  window.KUG = {
    LINKS: LINKS, ICON: ICON, esc: esc, fmtDate: fmtDate, titleOf: titleOf, typeLabel: typeLabel,
    youtubeEmbed: youtubeEmbed, posterCard: posterCard, posterMedia: posterMedia, addYear: addYear, load: load
  };

  /* ---------- header / footer ---------- */
  function currentPage() {
    // NAV href('about/' 등)와 비교할 키. /concert/<슬러그>/ 상세는 연주회기록 탭을 켠다
    var segs = location.pathname.replace(/index\.html$/, '').split('/').filter(Boolean);
    var last = segs[segs.length - 1] || '';
    if (last === 'concert.html' || segs[0] === 'concert') return 'concerts/';
    if (/\.html$/.test(last)) return last;
    return last ? last + '/' : 'index.html';
  }

  function renderHeader() {
    var host = document.getElementById('site-header');
    if (!host) return;
    var page = currentPage();
    var overHero = document.body.hasAttribute('data-hero');
    host.className = 'site-header' + (overHero ? ' over-hero' : '');
    host.innerHTML =
      '<div class="wrap">' +
      '<a class="brand" href="index.html" aria-label="고려대학교 고전기타부 홈">' +
      '<img class="brand-logo" src="assets/photos/logo.webp" alt="" width="38" height="38">' +
      '<span class="brand-text"><span class="brand-name">고려대학교 고전기타부</span><span class="brand-sub">KOREA UNIV. CLASSICAL GUITAR CLUB</span></span></a>' +
      '<nav class="nav" id="site-nav" aria-label="주 메뉴">' +
      NAV.map(function (n) {
        return '<a href="' + n.href + '"' + (n.href === page ? ' aria-current="page"' : '') + '>' + n.label + '</a>';
      }).join('') +
      '</nav>' +
      '<button class="icon-btn theme-btn" type="button" aria-label="다크 모드 전환"></button>' +
      '<button class="icon-btn menu-btn" type="button" aria-label="메뉴 열기" aria-expanded="false" aria-controls="site-nav">' + ICON.menu + '</button>' +
      '</div>';

    var themeBtn = host.querySelector('.theme-btn');
    function syncThemeIcon() {
      var dark = effectiveTheme() === 'dark';
      themeBtn.innerHTML = dark ? ICON.sun : ICON.moon;
      themeBtn.setAttribute('aria-label', dark ? '라이트 모드로 전환' : '다크 모드로 전환');
    }
    syncThemeIcon();
    themeBtn.addEventListener('click', function () {
      var next = effectiveTheme() === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem('kug-theme', next); } catch (e) {}
      syncThemeIcon();
    });

    var menuBtn = host.querySelector('.menu-btn');
    var nav = host.querySelector('.nav');
    function setMenu(open) {
      nav.classList.toggle('open', open);
      host.classList.toggle('menu-open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
      menuBtn.innerHTML = open ? ICON.close : ICON.menu;
    }
    menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    window.matchMedia('(min-width: 821px)').addEventListener('change', function (e) { if (e.matches) setMenu(false); });

    function onScroll() { host.classList.toggle('scrolled', window.scrollY > 8); }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function renderFooter() {
    var host = document.getElementById('site-footer');
    if (!host) return;
    host.className = 'site-footer';
    host.innerHTML =
      '<div class="wrap">' +
      '<div class="footer-top">' +
      '<div><div class="footer-brand"><img src="assets/photos/logo.webp" alt="" width="52" height="52">' +
      '<div><strong>고려대학교 고전기타부</strong><span>KOREA UNIV. CLASSICAL GUITAR CLUB · SINCE 1974</span></div></div>' +
      '<p class="footer-addr">02841 서울 성북구 안암로 145<br>고려대학교 안암캠퍼스 학생회관 611호</p></div>' +
      '<div><h4>둘러보기</h4><ul>' + NAV.map(function (n) { return '<li><a href="' + n.href + '">' + n.label + '</a></li>'; }).join('') + '</ul></div>' +
      '<div><h4>채널</h4><ul>' +
      '<li><a class="social" href="' + LINKS.youtube + '" target="_blank" rel="noopener">' + ICON.youtube + 'YouTube</a></li>' +
      '<li><a class="social" href="' + LINKS.instagram + '" target="_blank" rel="noopener">' + ICON.instagram + '@ku_classicguitar</a></li>' +
      '<li><a class="social" href="' + LINKS.band + '" target="_blank" rel="noopener">' + ICON.band + '교우회 BAND</a></li>' +
      '</ul></div></div>' +
      '<div class="footer-bottom"><span>© 1974–' + new Date().getFullYear() + ' Korea Univ. Classical Guitar Club</span><span>“기타는 작은 오케스트라다.”</span></div>' +
      '</div>';
  }

  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }
  window.KUG.initReveal = initReveal;

  document.addEventListener('DOMContentLoaded', function () {
    renderHeader();
    renderFooter();
    initReveal();
  });
})();

/* ---------- 팜플렛 라이트박스 (concert/<슬러그>/ 페이지의 .scan-grid) ---------- */
(function () {
  'use strict';
  var links = [], cur = -1, box = null, img = null, cap = null, lastFocus = null;

  function build() {
    box = document.createElement('div');
    box.className = 'lightbox';
    box.hidden = true;
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', '팜플렛 확대 보기');
    box.innerHTML =
      '<button type="button" class="lb-btn lb-close" aria-label="닫기 (Esc)">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '<button type="button" class="lb-btn lb-prev" aria-label="이전 (←)">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button>' +
      '<img alt="">' +
      '<button type="button" class="lb-btn lb-next" aria-label="다음 (→)">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></button>' +
      '<div class="lb-cap"></div>';
    document.body.appendChild(box);
    img = box.querySelector('img');
    cap = box.querySelector('.lb-cap');
    box.querySelector('.lb-close').addEventListener('click', close);
    box.querySelector('.lb-prev').addEventListener('click', function () { move(-1); });
    box.querySelector('.lb-next').addEventListener('click', function () { move(1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });

    var x0 = null;
    box.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (x0 == null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) move(dx > 0 ? -1 : 1);
      x0 = null;
    }, { passive: true });
  }

  function show(i) {
    cur = (i + links.length) % links.length;
    var a = links[cur], thumb = a.querySelector('img');
    var full = a.href;
    img.src = thumb ? thumb.src : full;   // 썸네일 먼저, 원본은 로드되는 대로 교체
    img.alt = thumb ? thumb.alt : '';
    img.classList.add('lb-loading');
    var pre = new Image();
    pre.onload = function () { if (links[cur] === a) { img.src = full; img.classList.remove('lb-loading'); } };
    pre.src = full;
    cap.textContent = (cur + 1) + ' / ' + links.length;
  }

  function open(i) {
    if (!box) build();
    lastFocus = document.activeElement;
    box.hidden = false;
    document.body.style.overflow = 'hidden';
    show(i);
    box.querySelector('.lb-close').focus();
  }

  function close() {
    box.hidden = true;
    img.removeAttribute('src');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function move(d) { show(cur + d); }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.scan-grid a');
    if (!a) return;
    links = [].slice.call(document.querySelectorAll('.scan-grid a'));
    var i = links.indexOf(a);
    if (i < 0) return;
    e.preventDefault();
    open(i);
  });

  document.addEventListener('keydown', function (e) {
    if (!box || box.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
  });
})();

/* ---------- 곡별 공연 영상 (details.pv) — 처음 펼칠 때만 iframe 주입 ---------- */
(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('details.pv').forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (!d.open) return;
        var box = d.querySelector('.pv-box');
        if (!box || box.querySelector('iframe')) return;
        var f = document.createElement('iframe');
        f.src = box.dataset.embed;
        f.title = '공연 영상';
        f.loading = 'lazy';
        f.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
        f.allowFullscreen = true;
        box.insertBefore(f, box.firstChild);
      });
    });
  });
})();

/* ---------- 재생목록 플레이어 (section.player + .tracklist) ---------- */
(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', function () {
    var player = document.querySelector('section.player');
    if (!player) return;
    var frame = document.getElementById('player-frame');
    var list = player.getAttribute('data-list') || '';

    // 기본은 숨김 — "재생목록 보기" 버튼으로 토글. 열 때만 iframe 로드, 닫으면 재생도 멈춘다.
    var btn = document.getElementById('playlist-toggle');
    if (btn) {
      btn.dataset.label = btn.textContent;
      btn.addEventListener('click', function () {
        var opening = player.hidden;
        player.hidden = !opening;
        btn.setAttribute('aria-expanded', String(opening));
        if (opening) {
          if (!frame.getAttribute('src')) frame.src = frame.dataset.src;
          btn.textContent = '재생목록 닫기';
          player.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          btn.textContent = btn.dataset.label;
          frame.removeAttribute('src');
          player.querySelectorAll('.track.playing').forEach(function (el) { el.classList.remove('playing'); });
        }
      });
    }

    player.addEventListener('click', function (e) {
      var b = e.target.closest('.track');
      if (!b || !frame) return;
      var v = b.getAttribute('data-v');
      frame.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(v) +
        '?autoplay=1' + (list ? '&list=' + encodeURIComponent(list) : '');
      player.querySelectorAll('.track').forEach(function (el) {
        el.classList.toggle('playing', el === b);
      });
      var ol = b.closest('ol');
      if (b.offsetTop < ol.scrollTop || b.offsetTop + b.offsetHeight > ol.scrollTop + ol.clientHeight)
        ol.scrollTop = b.offsetTop - ol.clientHeight / 2;
    });
  });
})();

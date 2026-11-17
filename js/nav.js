/* 고려대학교 고전기타부 — 공용 상단 메뉴
 *
 * kuguitar.com 의 모든 페이지와 다른 하위 사이트(notice.kuguitar.com 등)가 같이 쓴다.
 * 메뉴를 고치려면 아래 ITEMS 만 바꾸면 된다 — 다른 사이트는 다시 빌드할 필요 없음.
 *
 * 다른 사이트에서 쓰는 법:
 *   <link rel="stylesheet" href="https://kuguitar.com/css/nav.css">
 *   <header id="kug-header"></header>
 *   <script src="https://kuguitar.com/js/nav.js"></script>
 * 그 사이트 자체 메뉴는 data-local 로 넘기면 마지막 드롭다운으로 붙는다:
 *   <header id="kug-header" data-local='{"label":"공지사항","items":[{"href":"/","label":"전체글"}]}'>
 */
(function () {
  'use strict';

  // 링크 기준 주소 = 이 스크립트가 있는 사이트의 루트 (…/js/nav.js → …/)
  var me = document.currentScript;
  var BASE = me && me.src ? new URL('../', me.src).href : 'https://kuguitar.com/';
  var HOME = new URL(BASE);

  // 상대 주소는 BASE 기준, http(s):// 는 그대로
  var ITEMS = [
    { href: 'about/', label: '소개' },
    { href: 'concerts/', label: '연주회기록' },
    { href: 'students/', label: '재학생' },   // 추후 stu.kuguitar.com
    { href: 'alumni/', label: '교우회',       // 추후 alum.kuguitar.com
      sub: [
        { href: 'alumni/', label: '교우회 홈' },
        { href: 'https://notice.kuguitar.com/', label: '교우회 공지사항' }
      ] },
    { href: 'rules/', label: '회칙' }
  ];

  var ICON = {
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>'
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function abs(href) { return /^https?:\/\//.test(href) ? href : new URL(href, BASE).href; }

  // kuguitar.com 안에서 지금 페이지에 해당하는 메뉴 키 ('about/' 등). 연주회 상세는 연주회기록.
  function homeKey() {
    var rel = location.pathname.slice(HOME.pathname.length).replace(/index\.html$/, '');
    var segs = rel.split('/').filter(Boolean);
    if (segs[0] === 'concert' || segs[0] === 'concert.html') return 'concerts/';
    return segs.length ? segs[0] + '/' : '';
  }
  function isCurrent(href) {
    var u = new URL(abs(href));
    if (u.origin !== location.origin) return false;
    if (u.origin === HOME.origin && location.pathname.indexOf(HOME.pathname) === 0) {
      return u.pathname.slice(HOME.pathname.length) === homeKey();
    }
    return location.pathname.indexOf(u.pathname) === 0;   // 다른 사이트: 그 사이트 전체가 해당 메뉴
  }

  // local: 그 사이트 자체 메뉴 — href 를 그대로 둬서 그 사이트 기준으로 풀리게 한다 (현재 표시 없음)
  function link(it, local) {
    var cur = !local && isCurrent(it.href);
    return '<a href="' + esc(local ? it.href : abs(it.href)) + '"' + (it.id ? ' id="' + esc(it.id) + '"' : '') +
      (cur ? ' aria-current="page"' : '') + '>' + esc(it.label) + '</a>';
  }
  function group(label, subs, cur, local) {
    return '<div class="nav-group">' +
      '<button type="button" class="nav-parent"' + (cur ? ' aria-current="page"' : '') + ' aria-expanded="false">' +
      esc(label) + ICON.chevron + '</button>' +
      '<div class="nav-sub" hidden>' + subs.map(function (s) { return link(s, local); }).join('') + '</div></div>';
  }

  /* host 에 헤더를 그린다.
   * opts.extraButtons: 메뉴 버튼 앞에 넣을 HTML (kuguitar.com 은 다크모드 버튼)
   * opts.local: { label, items[{href,label,id?}] } — 그 사이트 자체 메뉴 (마지막 드롭다운) */
  function render(host, opts) {
    opts = opts || {};
    var html = ITEMS.map(function (n) {
      if (!n.sub) return link(n, false);
      return group(n.label, n.sub, n.sub.some(function (s) { return isCurrent(s.href); }));
    }).join('');
    if (opts.local && opts.local.items && opts.local.items.length) {
      html += group(opts.local.label || '메뉴', opts.local.items, false, true);
    }
    host.classList.add('kug-header');
    host.innerHTML =
      '<div class="wrap">' +
      '<a class="brand" href="' + esc(BASE) + '" aria-label="고려대학교 고전기타부 홈">' +
      '<img class="brand-logo" src="' + esc(abs('assets/photos/logo.webp')) + '" alt="" width="38" height="38">' +
      '<span class="brand-text"><span class="brand-name">고려대학교 고전기타부</span><span class="brand-sub">KOREA UNIV. CLASSICAL GUITAR CLUB</span></span></a>' +
      '<nav class="nav" id="site-nav" aria-label="주 메뉴">' + html + '</nav>' +
      (opts.extraButtons || '') +
      '<button class="icon-btn menu-btn" type="button" aria-label="메뉴 열기" aria-expanded="false" aria-controls="site-nav">' + ICON.menu + '</button>' +
      '</div>';

    var menuBtn = host.querySelector('.menu-btn');
    var nav = host.querySelector('.nav');
    function setMenu(open) {
      nav.classList.toggle('open', open);
      host.classList.toggle('menu-open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
      menuBtn.innerHTML = open ? ICON.close : ICON.menu;
    }
    function closeSubs(except) {
      nav.querySelectorAll('.nav-group').forEach(function (g) {
        if (g === except) return;
        g.querySelector('.nav-parent').setAttribute('aria-expanded', 'false');
        g.querySelector('.nav-sub').hidden = true;
      });
    }
    menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
    nav.addEventListener('click', function (e) {
      var btn = e.target.closest('.nav-parent');
      if (!btn) { if (e.target.closest('a')) { setMenu(false); closeSubs(); } return; }
      var g = btn.parentNode, sub = g.querySelector('.nav-sub'), open = sub.hidden;
      closeSubs(g);
      sub.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', function (e) { if (!e.target.closest('.nav-group')) closeSubs(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setMenu(false); closeSubs(); } });
    window.matchMedia('(min-width: 821px)').addEventListener('change', function (e) { if (e.matches) setMenu(false); });

    function onScroll() { host.classList.toggle('scrolled', window.scrollY > 8); }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  window.KUGNav = { BASE: BASE, ITEMS: ITEMS, abs: abs, isCurrent: isCurrent, render: render };

  // 다른 사이트: <header id="kug-header"> 가 있으면 자동으로 그린다
  function auto() {
    var host = document.getElementById('kug-header');
    if (!host || host.hasChildNodes()) return;
    var local = null;
    try { local = host.dataset.local ? JSON.parse(host.dataset.local) : null; } catch (e) {}
    render(host, { local: local });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', auto);
  else auto();
})();

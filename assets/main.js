(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  /* —— Mobile menu (full-width dropdown) —— */
  var menuBtn = document.getElementById('menu-toggle');
  var menuPanel = document.getElementById('mobile-menu');
  var menuBackdrop = document.getElementById('menu-backdrop');

  function setMenuOpen(open) {
    if (!menuBtn || !menuPanel) return;
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    menuPanel.setAttribute('aria-hidden', open ? 'false' : 'true');
    menuPanel.classList.toggle('is-open', open);
    if (menuBackdrop) {
      menuBackdrop.hidden = !open;
      menuBackdrop.classList.toggle('is-open', open);
    }
    document.body.classList.toggle('menu-open', open);
  }

  if (menuBtn && menuPanel) {
    menuBtn.addEventListener('click', function () {
      setMenuOpen(!menuPanel.classList.contains('is-open'));
    });
    if (menuBackdrop) {
      menuBackdrop.addEventListener('click', function () {
        setMenuOpen(false);
      });
    }
    menuPanel.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        setMenuOpen(false);
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenuOpen(false);
    });
  }

  /* —— Scroll reveal —— */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && !prefersReducedMotion && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -40px 0px', threshold: 0.08 }
    );
    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* —— Install step expand —— */
  document.querySelectorAll('.step-card__head').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = btn.closest('.step-card');
      var body = card && card.querySelector('.step-card__body');
      if (!card || !body) return;
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      body.hidden = open;
      card.classList.toggle('is-expanded', !open);
    });
  });

  /* —— Icon fallback —— */
  document.querySelectorAll('.brand img').forEach(function (img) {
    img.addEventListener('error', function () {
      if (!img.dataset.fb) {
        img.dataset.fb = '1';
        img.src = 'assets/app-icon.png';
      }
    });
  });

  /* —— version.json —— */
  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function formatSize(bytes) {
    if (!bytes || bytes <= 0) return '—';
    var mb = bytes / (1024 * 1024);
    return (mb >= 1 ? '~' + mb.toFixed(0) : '~' + mb.toFixed(1)) + ' МБ';
  }

  function formatDate(raw) {
    if (!raw) return '—';
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(raw)) return raw;
    var m = String(raw).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return m[3] + '.' + m[2] + '.' + m[1];
    return raw;
  }

  function normalizeSha(value) {
    if (!value || /ЗАМЕНИТЕ/i.test(value)) {
      return 'Загрузите APK и запустите update-apk-metadata.ps1';
    }
    return value;
  }

  fetch('version.json', { cache: 'no-store' })
    .then(function (r) {
      return r.ok ? r.json() : Promise.reject();
    })
    .then(function (v) {
      var ver = v.versionName || '1.0.0';
      var date = formatDate(v.buildDate);
      var build = v.buildId || '1.0.0+1';
      setText('meta-version', ver);
      setText('meta-build', build);
      setText('meta-date', date);
      var sizeStr = formatSize(v.apkSizeBytes);
      setText('meta-size', sizeStr);
      setText('meta-size-inline', sizeStr);
      setText('meta-sha', normalizeSha(v.sha256));
      setText('version-line', 'Версия ' + ver + ' от ' + date);
      var changelogTitle = document.getElementById('changelog-title');
      if (changelogTitle) {
        changelogTitle.textContent = 'Что нового в версии ' + ver;
      }
      document.querySelectorAll('.apk-link').forEach(function (a) {
        if (v.apkUrl) a.href = v.apkUrl;
      });
    })
    .catch(function () {
      setText('meta-version', '1.0.0');
      setText('meta-build', '1.0.0+1');
      setText('meta-date', '20.05.2026');
      setText('meta-size', '~25 МБ');
      setText('meta-size-inline', '~25 МБ');
      setText('meta-sha', 'Не удалось загрузить version.json');
      setText('version-line', 'Версия 1.0.0 от 20.05.2026');
    });
})();

// Progressive language detection. The site is fully usable without this file:
// the language selector is plain links and every page exists at its own URL.
// This script only adds two conveniences on top:
//   1. honour an explicit prior choice (stored when the visitor uses the
//      selector) by sending them to that language's URL, and
//   2. on a first visit to a default-language page, gently suggest the browser
//      language with a dismissible banner — never an automatic redirect, so it
//      stays friendly to users and search-engine crawlers alike.
//
// Language URLs are read from the <link rel="alternate" hreflang> tags already
// in the page, so this file needs no list of pages.
(function () {
  'use strict';

  var cfg = window.choosealicenseI18n;
  if (!cfg || !cfg.languages) {
    return;
  }

  var STORAGE_KEY = 'preferredLanguage';

  function storage() {
    try {
      return window.localStorage;
    } catch (e) {
      return null;
    }
  }

  function getStored() {
    var s = storage();
    if (!s) {
      return null;
    }
    try {
      return s.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function setStored(lang) {
    var s = storage();
    if (!s) {
      return;
    }
    try {
      s.setItem(STORAGE_KEY, lang);
    } catch (e) {
      // Ignore storage failures (private mode, quota, etc.).
    }
  }

  // Map of language code -> same-origin path, from the hreflang alternates.
  function alternates() {
    var map = {};
    var links = document.querySelectorAll('link[rel="alternate"][hreflang]');
    for (var i = 0; i < links.length; i++) {
      var hreflang = links[i].getAttribute('hreflang');
      if (!hreflang || hreflang === 'x-default') {
        continue;
      }
      try {
        var url = new URL(links[i].href, window.location.origin);
        map[hreflang] = url.pathname + url.search + url.hash;
      } catch (e) {
        // Skip malformed URLs.
      }
    }
    return map;
  }

  function detectFromBrowser() {
    var langs = navigator.languages || (navigator.language ? [navigator.language] : []);
    for (var i = 0; i < langs.length; i++) {
      var base = String(langs[i]).toLowerCase().split('-')[0];
      if (cfg.languages[base]) {
        return base;
      }
    }
    return null;
  }

  // Remember the visitor's choice when they use the language selector.
  function wireSelector() {
    var links = document.querySelectorAll('.language-selector a[hreflang]');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function () {
        setStored(this.getAttribute('hreflang'));
      });
    }
  }

  function showBanner(lang, path) {
    var strings = cfg.languages[lang] || {};
    var name = strings.name || lang;
    var suggest = (strings.suggest || '').replace('%{language}', name);
    var switchText = (strings.switch || '').replace('%{language}', name);
    var dismissText = strings.dismiss || '×';

    var bar = document.createElement('div');
    bar.className = 'language-banner';
    bar.setAttribute('role', 'region');
    bar.setAttribute('lang', lang);

    if (suggest) {
      var message = document.createElement('span');
      message.textContent = suggest + ' ';
      bar.appendChild(message);
    }

    var link = document.createElement('a');
    link.className = 'language-banner-switch';
    link.href = path;
    link.setAttribute('hreflang', lang);
    link.textContent = switchText || name;
    link.addEventListener('click', function () {
      setStored(lang);
    });
    bar.appendChild(link);

    var dismiss = document.createElement('button');
    dismiss.type = 'button';
    dismiss.className = 'language-banner-dismiss';
    dismiss.textContent = dismissText;
    dismiss.addEventListener('click', function () {
      // Treat dismissal as "I'm happy here" so we stop suggesting.
      setStored(cfg.current);
      if (bar.parentNode) {
        bar.parentNode.removeChild(bar);
      }
    });
    bar.appendChild(dismiss);

    document.body.appendChild(bar);
  }

  function run() {
    wireSelector();

    var alts = alternates();
    var stored = getStored();

    // 1) Honour an explicit prior choice.
    if (stored && cfg.languages[stored] && stored !== cfg.current && alts[stored]) {
      window.location.replace(alts[stored]);
      return;
    }

    // 2) First visit on the default language: suggest the browser language.
    if (!stored && cfg.current === cfg.default) {
      var detected = detectFromBrowser();
      if (detected && detected !== cfg.current && alts[detected]) {
        showBanner(detected, alts[detected]);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();

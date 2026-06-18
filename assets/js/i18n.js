// Progressive language help. The site is fully usable without this file: the
// language selector is plain links and every page exists at its own URL. On top
// of that, this script:
//   1. honours an explicit prior choice (stored when the visitor uses the
//      selector) by sending them to that language's URL, and
//   2. when there is no stored choice and the browser's preferred available
//      language differs from the one shown, surfaces a visible, clickable
//      suggestion next to the language selector (never an automatic redirect, so
//      it stays friendly to users and search-engine crawlers alike).
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

  // A curved arrow drawn from the suggestion button toward the language selector.
  var SUGGESTION_ARROW =
    '<svg class="language-suggestion-arrow" viewBox="0 0 40 24" aria-hidden="true" focusable="false">' +
    '<path d="M3 19 C 16 19, 21 6, 33 6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>' +
    '<path d="M26 2.5 L 34.5 6 L 27.5 11.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>';

  // Surface a visible, clickable suggestion beside the language selector, with a
  // curved arrow pointing at it.
  function showSuggestion(lang, path) {
    var container = document.querySelector('.language-suggestion');
    if (!container) {
      return;
    }
    var strings = cfg.languages[lang] || {};
    var name = strings.name || lang;
    var text = (strings.switch || strings.suggest || '').replace('%language%', name) || name;

    var link = document.createElement('a');
    link.className = 'language-suggestion-link';
    link.href = path;
    link.setAttribute('hreflang', lang);
    link.setAttribute('lang', lang);
    link.setAttribute('rel', 'alternate');
    link.textContent = text;
    link.addEventListener('click', function () {
      setStored(lang);
    });

    container.appendChild(link);
    container.insertAdjacentHTML('beforeend', SUGGESTION_ARROW);
    container.hidden = false;
  }

  function run() {
    wireSelector();

    var alts = alternates();
    var stored = getStored();

    // An explicit prior choice wins: honour it (and don't suggest anything).
    if (stored) {
      if (cfg.languages[stored] && stored !== cfg.current && alts[stored]) {
        window.location.replace(alts[stored]);
      }
      return;
    }

    // No stored choice: if the browser's preferred available language differs
    // from the one shown, suggest it next to the selector.
    var detected = detectFromBrowser();
    if (detected && detected !== cfg.current && alts[detected]) {
      showSuggestion(detected, alts[detected]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();

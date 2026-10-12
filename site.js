/* ==========================================================================
   site.js — shared behaviour for index.html and storm.html
   Progressive enhancement only: every feature below works without JS
   (native <details>, plain links) and this file merely improves it.
   Every querySelector is guarded so the file is safe on both pages.
   ========================================================================== */
(function () {
  'use strict';

  /* ---- 1. Mobile navigation ------------------------------------------- */
  var nav = document.querySelector('.site-nav');
  var toggle = document.querySelector('.nav-toggle');
  if (nav && toggle) {
    var setOpen = function (open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    toggle.addEventListener('click', function () {
      setOpen(!nav.classList.contains('is-open'));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
    nav.querySelectorAll('.nav-links a').forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
  }

  /* ---- 2. Profile icons: fall back to the original pic/ copies ----------
     The icons are loaded from media/; if a copy is missing there, the
     data-fallback path (./pic/…) is tried once. */
  document.querySelectorAll('.profile-links img[data-fallback]').forEach(function (img) {
    var useFallback = function () {
      var alt = img.getAttribute('data-fallback');
      if (alt && img.getAttribute('src') !== alt) { img.setAttribute('src', alt); }
    };
    img.addEventListener('error', useFallback, { once: true });
    /* The image may already have failed before this script ran. */
    if (img.complete && img.naturalWidth === 0) { useFallback(); }
  });

  /* ---- 3. Footer year -------------------------------------------------- */
  var yr = document.getElementById('yr');
  if (yr) { yr.textContent = String(new Date().getFullYear()); }

  /* ---- 4. Publication filters (index.html only) ------------------------
     Markup contract: .pub-toolbar holds .chip buttons with data-filter
     ("view" | "topic" | "year") and data-value; each article.pub carries
     data-year and space-separated data-tags, and the class "pub-selected"
     marks the curated set. Topic and Year combine with AND. Choosing a
     Topic or Year switches the view to "All" so the selection never hides
     results; choosing "Selected" clears both filters. Nothing touches the
     URL hash. Without JavaScript the toolbar is hidden by homepage.css and
     every entry is visible. */
  var toolbar = document.querySelector('.pub-toolbar');
  var list = document.querySelector('.pub-list');
  if (toolbar && list) {
    document.documentElement.classList.add('js-ready');
    var pubs = Array.prototype.slice.call(list.querySelectorAll('.pub'));
    var chips = Array.prototype.slice.call(toolbar.querySelectorAll('.chip[data-filter]'));
    var count = toolbar.querySelector('.pub-count');
    var empty = document.querySelector('.pub-empty');
    var state = { view: 'selected', topic: 'all', year: 'all' };

    var matchesYear = function (pub, year) {
      if (year === 'all') { return true; }
      var y = parseInt(pub.getAttribute('data-year'), 10);
      if (year === 'older') { return y <= 2022; }
      return y === parseInt(year, 10);
    };
    var matchesTopic = function (pub, topic) {
      if (topic === 'all') { return true; }
      var tags = (pub.getAttribute('data-tags') || '').split(/\s+/);
      return tags.indexOf(topic) !== -1;
    };
    var paint = function () {
      var shown = 0;
      pubs.forEach(function (pub) {
        var ok = matchesTopic(pub, state.topic) && matchesYear(pub, state.year) &&
          (state.view === 'all' || pub.classList.contains('pub-selected'));
        pub.classList.toggle('pub-hidden', !ok);
        if (ok) { shown += 1; }
      });
      list.setAttribute('data-view', state.view);
      chips.forEach(function (chip) {
        var pressed = state[chip.getAttribute('data-filter')] === chip.getAttribute('data-value');
        chip.setAttribute('aria-pressed', pressed ? 'true' : 'false');
      });
      if (count) {
        count.textContent = 'Showing ' + shown + ' of ' + pubs.length + ' publications';
      }
      if (empty) {
        if (shown === 0) { empty.removeAttribute('hidden'); } else { empty.setAttribute('hidden', ''); }
      }
    };
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var group = chip.getAttribute('data-filter');
        var value = chip.getAttribute('data-value');
        state[group] = value;
        if (group === 'view' && value === 'selected') {
          state.topic = 'all';
          state.year = 'all';
        } else if (group !== 'view' && value !== 'all') {
          state.view = 'all';
        }
        paint();
      });
    });
    var reset = document.querySelector('.pub-empty .pub-reset');
    if (reset) {
      reset.addEventListener('click', function () {
        state.view = 'all';
        state.topic = 'all';
        state.year = 'all';
        paint();
        var first = toolbar.querySelector('.chip[data-filter="view"][data-value="all"]');
        if (first) { first.focus(); }
      });
    }
    /* Persistent "Reset filters" next to the count: shown whenever the toolbar
       is away from its default state (Selected · All topics · All years). */
    var inlineReset = toolbar.querySelector('.pub-reset-inline');
    if (inlineReset) {
      inlineReset.addEventListener('click', function () {
        state.view = 'selected';
        state.topic = 'all';
        state.year = 'all';
        paint();
        var first = toolbar.querySelector('.chip[data-filter="view"][data-value="selected"]');
        if (first) { first.focus(); }
      });
    }
    var basePaint = paint;
    paint = function () {
      basePaint();
      if (inlineReset) {
        var isDefault = state.view === 'selected' && state.topic === 'all' && state.year === 'all';
        if (isDefault) { inlineReset.setAttribute('hidden', ''); } else { inlineReset.removeAttribute('hidden'); }
      }
    };
    paint();
  }
})();

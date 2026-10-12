/* ==========================================================================
   storm.js — video behaviour for storm.html (progressive enhancement)
   The video never autoplays: it has an audio track, and reduced-motion
   users must not have anything start on its own. This file only reveals a
   single play/pause button that mirrors the native player's state. Without
   JavaScript the button stays hidden and the native controls do everything.
   ========================================================================== */
(function () {
  'use strict';

  var video = document.getElementById('storm-video');
  var button = document.getElementById('storm-play');
  if (!video || !button || typeof video.play !== 'function') { return; }

  var controls = button.parentNode;

  var reflect = function () {
    var playing = !video.paused && !video.ended;
    button.textContent = playing ? 'Pause video' : 'Play video';
    button.setAttribute('aria-pressed', playing ? 'true' : 'false');
  };

  button.addEventListener('click', function () {
    if (video.paused || video.ended) {
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        /* A rejected play (unsupported codec, blocked media) leaves the
           native controls in charge; the label simply stays at "Play". */
        attempt.catch(function () { reflect(); });
      }
    } else {
      video.pause();
    }
  });

  ['play', 'playing', 'pause', 'ended', 'emptied'].forEach(function (name) {
    video.addEventListener(name, reflect);
  });

  /* Nothing is started here, with or without a reduced-motion preference;
     the check is kept explicit so the intent survives future edits. */
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    video.autoplay = false;
  }

  reflect();
  if (controls && controls.hasAttribute('hidden')) { controls.removeAttribute('hidden'); }
})();

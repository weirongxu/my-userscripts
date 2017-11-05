// ==UserScript==
// @name         Video change play rate
// @namespace    https://gist.github.com/weirongxu/c0d241ff3d94b2140570bf56124b382a
// @version      0.1
// @description  Video change play rate
// @author       Raidou
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
'use strict';

var script = document.createElement("script");
script.setAttribute("src", "//code.jquery.com/jquery-2.2.4.min.js");
script.addEventListener('load', () => {
  main(jQuery.noConflict(true));
}, false);
document.body.appendChild(script);

function main($) {
  $(document).on('keydown', (e) => {
    if (e.ctrlKey) {
      const $video = $('video');
      switch (e.key.toLowerCase()) {
        case '[':
          $video.each(function() {
            this.playbackRate -= 0.05;
          });
          return false;
        case ']':
          $video.each(function() {
            this.playbackRate += 0.05;
          });
          return false;
        case 'backspace':
          $video.each(function() {
            this.playbackRate = 1
          });
          return false;
      }
    }
  });
}
})();

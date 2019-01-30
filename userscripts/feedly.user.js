// ==UserScript==
// @name         feedly
// @namespace    https://github.com/weirongxu/my-userscripts
// @version      0.0.1
// @description  feedly
// @author       Raidou
// @match        *://feedly.com/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  document.addEventListener('keydown', e => {
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
      return;
    }
    const stopEvent = () => {
      e.preventDefault();
      e.stopPropagation();
    };
    if (e.shiftKey) {
      switch(e.key) {
        case '"':
          document.querySelectorAll('.list-entries .visual').forEach((el) => {
            if (! el.dataset.imageZoomIn) {
              el.dataset.imageZoomIn = true
              el.style.backgroundSize = 'contain';
              el.style.width = '300px';
              el.style.height = '300px';
            } else {
              delete el.dataset.imageZoomIn;
              el.style.backgroundSize = null;
              el.style.width = null;
              el.style.height = null;
            }
          })
          stopEvent();
          return;
      }
    }
  });
})();

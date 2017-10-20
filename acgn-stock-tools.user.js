// ==UserScript==
// @name         acgn-stock tools
// @namespace    https://gist.github.com/weirongxu/c0d241ff3d94b2140570bf56124b382a
// @version      0.1
// @description  acgn-stock tools
// @require      https://code.jquery.com/jquery-latest.js
// @author       Raidou
// @match        *://acgn-stock.com/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';
  const waitFor = (selector, maxCount=20, timeout=500) => {
    let count = 0;
    return new Promise((resolve, reject) => {
      const check = () => {
        if ($(selector).length) {
          resolve();
        } else {
          count ++;
          if (count < maxCount) {
            setTimeout(check, timeout);
          } else {
            reject();
          }
        }
      };
      check();
    });
  };

  const newsSelector = '.fixed-bottom .container .rounded:has(.fa-times)';
  waitFor(newsSelector).then(() => {
    $('body').append(`
      <div
        id="toggle-news"
        class="btn btn-danger"
        style="position: fixed; bottom: 35px; right: 5px; z-index: 100000"
      >toggle news</div>
    `);
    const $newsDom = () => $(newsSelector);
    $newsDom.hide();
    $('#toggle-news').on('click', () => {
      const isShow = $newsDom().toArray().every(it => $(it).is(':visible'));
      $newsDom().slideToggle(!isShow);
    });
  });
})();
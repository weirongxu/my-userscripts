// ==UserScript==
// @name         acgn-stock toggle news
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  acgn-stock toggle news
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

  waitFor('.fixed-bottom .container .rounded .d-flex a.btn').then(() => {
    $('body').append(`
      <div
        id="toggle-news"
        class="btn btn-danger"
        style="position: fixed; bottom: 35px; right: 5px; z-index: 100000"
      >toggle news</div>
    `);
    const $newsDom = $('.fixed-bottom .container');
    console.dir($newsDom);
    $newsDom.hide();
    $('#toggle-news').on('click', () => {
      $newsDom.find('.rounded').toggle({display: 'block'});
      /*
      $('.fixed-bottom .container .rounded .d-flex a.btn').each(function() {
        this.click();
      });
      */
    });
  });
})();
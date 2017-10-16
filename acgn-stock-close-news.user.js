// ==UserScript==
// @name         acgn-stock close news
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  acgn-stock close news
// @require      https://code.jquery.com/jquery-latest.js
// @author       Raidou
// @match        *://acgn-stock.com/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';
  $('body').append(`
    <div
      id="close-all-news"
      class="btn btn-danger"
      style="position: fixed; bottom: 35px; right: 5px; z-index: 100000"
    >close news</div>
  `);
  $('#close-all-news').on('click', () => {
    $('.fixed-bottom .rounded .d-flex a.btn').each(function() {
      this.click();
    });
  });
})();

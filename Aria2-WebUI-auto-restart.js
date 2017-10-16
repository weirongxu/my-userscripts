// ==UserScript==
// @name         aria2 WebUI auto restart
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  aria2 WebUI auto restart!
// @author       Raidou
// @require      https://code.jquery.com/jquery-latest.js
// @match        *://ziahamza.github.io/webui-aria2*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  setInterval(function() {
    let $downloads = $('.download');
    $downloads.each(function() {
      let $errorStats = $(this).find('.download-overview li.label-danger');
      if ($errorStats.find('span[title="Error"]').length || $errorStats.find('span[title="出错的"]').length) {
        $(this).find('.fa-repeat').click();
      }
    });
  }, 5000);
})();

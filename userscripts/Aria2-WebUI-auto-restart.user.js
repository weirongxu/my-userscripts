// ==UserScript==
// @name         aria2 WebUI auto restart
// @namespace    https://github.com/weirongxu/my-userscripts
// @version      0.3.0
// @description  aria2 WebUI auto restart!
// @author       Raidou
// @require      https://code.jquery.com/jquery-latest.js
// @match        *://ziahamza.github.io/webui-aria2*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  function confirmTrue(fn) {
    return new Promise((resolve, reject) => {
      const confirm = window.confirm;
      window.confirm = () => {
        window.confirm = confirm;
        resolve();
        return true;
      };
      fn();
    });
  }

  function wait(time) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, time);
    });
  }

  async function check() {
    while(true) {
      const $downloads = $('.download');
      const errors = $downloads.toArray().map((download) => {
        const $download = $(download);
        return {
          $: $download,
          $errorStats: $download.find('.download-overview li.label-danger'),
        }
      }).filter((obj) => {
        const $stats = obj.$errorStats;
        return $stats.find('span[title="Error"]').length || $stats.find('span[title="出错的"]').length
      });
      if (! errors.length) {
        return;
      }
      const conf = errors[0];
      if (conf.$errorStats.text().trim().includes('file already existed')) {
        await confirmTrue(() => {
          conf.$.find('.fa-stop').click();
        });
      } else {
        conf.$.find('.fa-repeat').click();
        await wait(500);
      }
    }
  }

  async function loop() {
    await check();
    await wait(20000);
    loop();
  }

  loop();
})();

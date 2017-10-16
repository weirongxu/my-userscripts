// ==UserScript==
// @name         百度网盘直接下载助手 生成链接到 Aria2 WebUI， 包含--out filename
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  百度网盘直接下载助手 生成链接到 Aria2 WebUI， 包含--out filename
// @author       Raidou
// @require      https://code.jquery.com/jquery-latest.js
// @match        *://pan.baidu.com/disk/home*
// @match        *://yun.baidu.com/disk/home*
// @match        *://pan.baidu.com/s/*
// @match        *://yun.baidu.com/s/*
// @match        *://pan.baidu.com/share/link*
// @match        *://yun.baidu.com/share/link*
// @grant        GM_setClipboard
// ==/UserScript==

(function() {
  'use strict';

  $(document.body).on('click', '.g-dropdown-button', function() {
    let id = 'dialog-copy-button-with-out';
    for (let i=0; i < 5; ++i) {
      setTimeout(() => {
        if (! document.getElementById(id)) {
          $('.dialog').each(function() {
            let $this = $(this);
            if ($this.find('.dialog-header h3').text() === '批量链接') {
              var $button = $this.find('.dialog-button > div').append(`<button id="${id}">复制为url --out filename</button>`);
              $button.on('click', function() {
                copyUrls($this);
              });
            }
          });
        }
      }, 200 * i);
    }
  });

  function copyUrls($this) {
    let urls = [];
    $this.find('.dialog-body > div').each(function() {
      urls.push(`${$(this).find('a').attr('href')} --out="${$(this).find('div').text()}"`);
    });
    urls = urls.join('\n');
    GM_setClipboard(urls, 'text');
    alert('已将链接复制到剪贴板！');
  }
})();

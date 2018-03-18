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

const wait = (time) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time);
  });
};

const waitFn = (fn, maxCount=20, timeout=500) => {
  let count = 0;
  return new Promise((resolve, reject) => {
    const check = async () => {
      if (await fn()) {
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

const waitFor = (selector, maxCount=20, timeout=500) => waitFn(() => $(selector).length, maxCount, timeout);

const voteCount = () => {
  return parseFloat($('#nav .navbar-brand.dropdown .dropdown-menu div:eq(2)').text());
};

const voteAll = async () => {
  let count = voteCount()
  if (count > 0) {
    const titleSelector = '.card-title.mb-1:contains(產品中心)';
    const waitLoading = async () => {
      await waitFor('.loadingOverlay.d-none');
    };
    const waitProductPage = async () => {
      await waitFor(titleSelector);
      await waitFn(() => $('table.product-list-by-season>tbody>tr').length >= 30);
      await wait(1000);
      await waitLoading();
    };
    if (! $(titleSelector).length) {
      $('a.nav-link:contains(產品中心)')[0].click();
      await waitProductPage();
    }
    const voteRun = async () => {
      const $btns = $('td[data-title=得票數] button:not([disabled=true])');
      if ($btns.length) {
        const modelBtnSelector = '.modal.show .modal-footer button:contains(確認)';
        for (let i=0; i < $btns.length && count > 0; ++i) {
          const $btn = $btns[i];
          $btn.click();
          await waitFor(modelBtnSelector);
          $(modelBtnSelector).click();
          await wait(100);
          await waitLoading();
          count --;
        }
      }
      if (count > 0) {
        $('.page-link[title=下一頁]')[0].click();
        await waitProductPage();
        await voteRun();
      }
    }
    await voteRun();
  }
};

const newsSelector = '.fixed-bottom .container .rounded:has(.fa-times)';
waitFor(newsSelector).then(() => {
  $('body').append(`
    <div
      class="btn-group"
      role="group"
      style="position: fixed; bottom: 35px; right: 5px; z-index: 100000"
    >
      <div id="vote-all" class="btn btn-info">vote all</div>
      <div id="toggle-news" class="btn btn-danger">toggle news</div>
    </div>
  `);
  const $newsDom = () => $(newsSelector);
  $newsDom().hide();
  $('#toggle-news').on('click', () => {
    const isShow = $newsDom().toArray().some(it => $(it).is(':visible'));
    if (isShow) {
      $newsDom().fadeOut();
    } else {
      $newsDom().fadeIn();
    }
  });

  $('#vote-all').on('click', () => {
    voteAll();
  });
});
})();

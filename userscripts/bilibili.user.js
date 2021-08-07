// ==UserScript==
// @name         bilibili
// @namespace    https://github.com/weirongxu/my-userscripts
// @version      0.7.6
// @description  bilibili
// @author       Raidou
// @match        *://*.bilibili.com/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';
  (function initStyle() {
    const head = document.head;
    const style = document.createElement('style');
    style.textContent = `
      .bui-slider .bui-track.bui-track-video-progress {
        height: 10px !important;
      }
    `;
    head.appendChild(style);
  })();

  /**
   * locationchange event
   */
  history.pushState = ((f) =>
    function pushState() {
      const ret = f.apply(this, arguments);
      window.dispatchEvent(new Event('pushState'));
      window.dispatchEvent(new Event('locationchange'));
      return ret;
    })(history.pushState);

  history.replaceState = ((f) =>
    function replaceState() {
      const ret = f.apply(this, arguments);
      window.dispatchEvent(new Event('replaceState'));
      window.dispatchEvent(new Event('locationchange'));
      return ret;
    })(history.replaceState);

  window.addEventListener('popstate', () => {
    window.dispatchEvent(new Event('locationchange'));
  });

  /**
   * DOM utils
   */
  function click($elem, _event) {
    if ($elem) {
      $elem.click();
    }
  }

  const $curPlayerItem = () =>
    document.querySelector(
      '.bilibili-player .bilibili-player-auxiliary-area .bilibili-player-watchlater-item[data-state-play=true]',
    );

  /**
   * hotkey
   */
  document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
      return;
    }
    const stopEvent = () => {
      e.preventDefault();
      e.stopPropagation();
    };
    if (e.shiftKey) {
      switch (e.key) {
        case 'ArrowLeft':
          stopEvent();
          click(
            $curPlayerItem().previousSibling.querySelector(
              '.bilibili-player-watchlater-item-sup',
            ),
          );
          return;
        case 'ArrowRight':
          stopEvent();
          click(
            $curPlayerItem().nextSibling.querySelector(
              '.bilibili-player-watchlater-item-sup',
            ),
          );
          return;
        case 'ArrowUp':
          stopEvent();
          click(
            $curPlayerItem().querySelector(
              '.bilibili-player-watchlater-part-item[data-state-play=true]',
            ).previousSibling,
          );
          return;
        case 'ArrowDown':
          stopEvent();
          click(
            $curPlayerItem().querySelector(
              '.bilibili-player-watchlater-part-item[data-state-play=true]',
            ).nextSibling,
          );
          return;
        case '|':
          stopEvent();
          click(
            $curPlayerItem().querySelector(
              '.bilibili-player-watchlater-info-remove.bilibili-player-fr.player-tooltips-trigger',
            ),
          );
          return;
        case 'P':
          stopEvent();
          click(
            $curPlayerItem().previousSibling.querySelector(
              '.bilibili-player-watchlater-info-remove.bilibili-player-fr.player-tooltips-trigger',
            ),
          );
          return;
        case 'A':
          stopEvent();
          openTimelineVideo();
          return;
      }
    }
  });

  /**
   * Add see-later to activity home page
   */
  const bindSeeLater = () => {
    if (location.href === 'https://t.bilibili.com/?tab=8') {
      const cardSeeLater = ($card) => {
        const $later = $card.querySelector('.see-later');
        if (!$later.matches('.done')) {
          click($later);
        }
      };
      const cardSeeLaterAbove = ($card) => {
        cardSeeLater($card);
        const $prevCard = $card.previousElementSibling;
        if ($prevCard) {
          cardSeeLaterAbove($prevCard);
        }
      };

      document
        .querySelector('.card-list .content')
        .addEventListener('mouseover', (e) => {
          const $card = e.target;
          if ($card.matches('.card')) {
            if (!e.target.querySelector('.see-later-above')) {
              e.target.querySelector('.button-bar.tc-slate').insertAdjacentHTML(
                'afterend',
                `
                  <span class="see-later-above">see later above</span>
                `,
              );
              e.target
                .querySelector('.see-later-above')
                .addEventListener('click', () => {
                  cardSeeLaterAbove($card);
                });
            }
          }
        });
    }
  };

  window.addEventListener('locationchange', function () {
    setTimeout(bindSeeLater, 5000);
  });

  setTimeout(bindSeeLater, 5000);

  /**
   * Auto open video and play
   */
  const tryCall = (callback, maxCount = 10, count = 0) => {
    if (!callback() && count <= maxCount) {
      setTimeout(() => tryCall(callback, maxCount, count + 1), 1000);
    }
  };

  const openTimelineVideo = () => {
    tryCall(() => {
      const link = document.querySelector('.video-container a');
      if (link) {
        location.href = link.href;
        return true;
      } else {
        return false;
      }
    });
  };

  const autoOpenVideo = () => {
    if (location.href.startsWith('https://t.bilibili.com')) {
      openTimelineVideo();
    }
  };

  // const autoPlay = () => {
  //   tryCall(() => {
  //     const btn = document.querySelector(
  //       '.bilibili-player-video-btn.bilibili-player-video-web-fullscreen',
  //     );
  //     const playBtn = document.querySelector('.bilibili-player-video');
  //     if (btn && playBtn) {
  //       click(btn);
  //       setTimeout(() => click(playBtn), 500);
  //       return true;
  //     } else {
  //       return false;
  //     }
  //   });
  // };

  if (document.referrer.startsWith('https://feedly.com/')) {
    autoOpenVideo();
  }

  // if (
  //   ['https://t.bilibili.com', 'https://feedly.com/'].some((href) =>
  //     document.referrer.startsWith(href),
  //   )
  // ) {
  //   autoPlay();
  // }

  /**
   * reduce the window.requestAnimationFrame
   */
  // const requestAnimationFrame = window.requestAnimationFrame;
  // const cancelAnimationFrame = window.cancelAnimationFrame;
  // window.requestAnimationFrame = (callback) => {
  //   return setTimeout(callback, 1000);
  // };
  // window.cancelAnimationFrame = (id) => {
  //   clearTimeout(id);
  // };
})();

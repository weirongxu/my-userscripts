// ==UserScript==
// @name         video controller
// @namespace    https://github.com/weirongxu/my-userscripts
// @version      0.8.1
// @description  video controller
// @author       Raidou
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  (function initStyle() {
    const head = document.head;
    const style = document.createElement('style');
    style.type = 'text/css';
    style.textContent = `
      .video-controller-info {
        background: rgba(0, 0, 0, 0.5);
        color: white;
        padding: 5px;
        z-index: 1000000000;
        border-radius: 5px;
        font-size: 12px;
        visibility: hidden;
        position: fixed;
        opacity: 0;
        transition: opacity .5s, visibility .5s;
      }
      .video-controller-info.video-controller-info-show {
        opacity: 1;
        visibility: visible;
      }
    `;
    head.appendChild(style);
  })();

  function setStyle($elem, css) {
    Object.entries(css).forEach(([key, val]) => {
      $elem.style[key] = val;
    });
  }

  let infoTimer = null;
  function showInfo(video, info) {
    const rect = video.getBoundingClientRect();
    const cls = 'video-controller-info';
    const $roots = document.querySelectorAll(
      'body, :-webkit-full-screen:not(video)',
    );
    const $root = $roots[$roots.length - 1];
    let $info = $root.querySelector(`.${cls}`);
    if (!$info) {
      $root.insertAdjacentHTML('beforeend', `<div class="${cls}"></div>`);
      $info = $root.querySelector(`.${cls}`);
    }
    $info.innerHTML = info;
    setStyle($info, {
      left: rect.left + video.clientWidth / 2 - $info.clientWidth / 2 + 'px',
      top: rect.top + video.clientHeight / 2 - $info.clientHeight / 2 + 'px',
    });
    $info.classList.add('video-controller-info-show');
    clearTimeout(infoTimer);
    infoTimer = setTimeout(() => {
      $info.classList.remove('video-controller-info-show');
    }, 600);
  }

  function closest($elem, selector, _default = null) {
    let matches;
    if (typeof selector === 'string') {
      matches = ($elem) => $elem.matches(selector);
    } else if (typeof selector === 'function') {
      matches = selector;
    }
    while (!matches($elem)) {
      $elem = $elem.parentElement;
      if (!$elem) {
        return _default;
      }
    }
    return $elem;
  }

  function inView($elems) {
    let maxVisibleArea = 0;
    let winningElem = null;
    $elems.forEach((elem) => {
      const rect = elem.getBoundingClientRect();
      const left = Math.max(rect.left, 0);
      const top = Math.max(rect.top, 0);
      const right = Math.min(rect.right, window.innerWidth);
      const bottom = Math.min(rect.bottom, window.innerHeight);
      const visibleArea = (right - left) * (bottom - top);
      if (visibleArea > maxVisibleArea) {
        maxVisibleArea = visibleArea;
        winningElem = elem;
      }
    });
    return winningElem;
  }

  function videoInView() {
    return inView(document.querySelectorAll('video'));
  }

  function iframeInView() {
    return inView(document.querySelectorAll('iframe'));
  }

  function click($elem) {
    $elem?.click();
  }

  function eventTrigger(eventName) {
    /**
     * @param callback {(video: Video) => void}
     */
    const existsVideo = (callback) => {
      const video = videoInView();
      if (video) {
        callback(video);
      } else {
        const iframe = iframeInView();
        if (iframe) {
          iframe.contentWindow.postMessage(
            {
              videoController: {
                eventName,
              },
            },
            '*',
          );
        }
      }
    };

    const eventHanders = {
      'track prev': () => {
        click(
          [
            // bilibili
            document
              .querySelector('#multi_page > div.cur-list > ul > li.on')
              ?.previousSibling.querySelector('a > .clickitem'),
            document
              .querySelector(
                '#eplist_module > div.list-wrapper.simple.longlist > ul > li.ep-item.cursor',
              )
              ?.previousSibling.querySelector('a'),
          ].find((it) => it),
        );
      },
      'track next': () => {
        click(
          [
            document.querySelector(
              [
                // bilibili
                '.bilibili-player-video-btn-next',
                '.squirtle-video-next',
              ].join(','),
            ),
            // bilibili
            document
              .querySelector('#multi_page > div.cur-list > ul > li.on')
              ?.nextSibling.querySelector('a > .clickitem'),
            document
              .querySelector(
                '#eplist_module > div.list-wrapper.simple.longlist > ul > li.ep-item.cursor',
              )
              ?.nextSibling.querySelector('a'),
          ].find((it) => it),
        );
      },
      'rate down': () => {
        existsVideo((video) => {
          const rate = video.playbackRate * 10;
          video.playbackRate = (rate - 1) / 10;
          showInfo(video, `rate: ${video.playbackRate.toFixed(2)}`);
        });
      },
      'rate up': () => {
        existsVideo((video) => {
          const rate = video.playbackRate * 10;
          video.playbackRate = (rate + 1) / 10;
          showInfo(video, `rate: ${video.playbackRate.toFixed(2)}`);
        });
      },
      'rate resume': () => {
        existsVideo((video) => {
          video.playbackRate = 1;
          showInfo(video, `rate: ${video.playbackRate.toFixed(2)}`);
        });
      },
      'picture in picture': async () => {
        // if ('documentPictureInPicture' in window) {
        //   if (documentPictureInPicture.window) {
        //     documentPictureInPicture.window.close();
        //     return;
        //   } else {
        //     /**
        //      * @type {{
        //      *  cls: string,
        //      *  css?: string,
        //      *  attach: (props: {el: HTMLElement, win: Window}) => () => void,
        //      * }}
        //      */
        //     const rules = [
        //       // bilibili
        //       {
        //         cls: '.bpx-player-video-area',
        //         css: `.bpx-player-control-bottom { display: none !important; }`,
        //       },
        //       // youtube
        //       {
        //         cls: '.html5-video-player',
        //         css: `video { width: 100vw !important; height: 100vh !important; }`,
        //       },
        //     ];
        //     for (const rule of rules) {
        //       const pipEl = document.querySelector(rule.cls);
        //       if (!pipEl) continue;
        //
        //       const parentDoc = pipEl.parentElement;
        //       const childIdx = [...parentDoc.childNodes].indexOf(pipEl);
        //       const pipWindow = await documentPictureInPicture.requestWindow({
        //         width: 500,
        //         height: 300,
        //       });
        //
        //       // Copy all style sheets.
        //       [...document.styleSheets].forEach((styleSheet) => {
        //         try {
        //           const cssRules = [...styleSheet.cssRules]
        //             .map((rule) => rule.cssText)
        //             .join('');
        //           const style = document.createElement('style');
        //
        //           style.textContent = cssRules;
        //           pipWindow.document.head.appendChild(style);
        //         } catch (e) {
        //           const link = document.createElement('link');
        //
        //           link.rel = 'stylesheet';
        //           link.type = styleSheet.type;
        //           link.media = styleSheet.media;
        //           link.href = styleSheet.href;
        //           pipWindow.document.head.appendChild(link);
        //         }
        //       });
        //       if (rule.css) {
        //         const style = document.createElement('style');
        //         style.textContent = rule.css;
        //         pipWindow.document.head.appendChild(style);
        //       }
        //
        //       // pip
        //       pipWindow.document.body.append(pipEl);
        //       const dispose = rule.attach?.({ el: pipEl, win: pipWindow });
        //       pipWindow.addEventListener(
        //         'pagehide',
        //         () => {
        //           dispose?.();
        //           parentDoc.insertBefore(pipEl, parentDoc.childNodes[childIdx]);
        //         },
        //         { once: true },
        //       );
        //       return;
        //     }
        //   }
        // }
        existsVideo(async (video) => {
          if (video !== document.pictureInPictureElement) {
            await video.requestPictureInPicture();
          } else {
            document.exitPictureInPicture();
          }
        });
      },
      'page fullscreen': () => {
        click(
          document.querySelector(
            [
              // bilibili
              '.bpx-player-ctrl-btn.bpx-player-ctrl-web',
              // bilibili live
              '.bilibili-live-player-video-controller-web-fullscreen-btn .icon-btn',
              // ixigua
              '.xgplayer-cssfullscreen',
              // youtube
              '.ytp-size-button',
              // acfun
              '.fullscreen.fullscreen-web .btn-span',
            ].join(','),
          ),
        );
      },
      fullscreen: () => {
        click(
          document.querySelector(
            [
              // bilibili
              '.bpx-player-ctrl-btn.bpx-player-ctrl-full',
              // bilibili live
              '.bilibili-live-player-video-controller-fullscreen-btn .icon-btn',
              // ixigua
              '.xgplayer-fullscreen',
              // youtube
              '.ytp-fullscreen-button',
              // acfun
              '.fullscreen.fullscreen-screen .btn-span',
            ].join(','),
          ),
        );
      },
    };

    if (eventName in eventHanders) {
      eventHanders[eventName]();
    }
  }

  window.addEventListener('message', (event) => {
    if (event.data.videoController && event.data.videoController.eventName) {
      eventTrigger(event.data.videoController.eventName);
    }
  });

  class Key {
    constructor(event) {
      /** @type {KeyboardEvent} */
      this.event = event;
      /**
       * @type {[{ctrl: boolean, shift: boolean, alt: boolean, key: string}, string][]}
       **/
      this.binded = [];
    }

    /**
     * @param s {string}
     * @param name {string}
     * @return {Key}
     */
    bind(s, name) {
      const k = {
        ctrl: false,
        shift: false,
        alt: false,
      };
      s = s.toLowerCase();
      if (s.includes('c-')) {
        k.ctrl = true;
        s = s.replace('c-', '');
      }
      if (s.includes('s-')) {
        k.shift = true;
        s = s.replace('s-', '');
      }
      if (s.includes('a-')) {
        k.alt = true;
        s = s.replace('a-', '');
      }
      k.key = s;
      this.binded.push([k, name]);
      return this;
    }

    stopEvent() {
      this.event.preventDefault();
      this.event.stopPropagation();
    }

    boot() {
      const matched = this.binded.find(([k]) => {
        return (
          k.ctrl === this.event.ctrlKey &&
          k.alt === this.event.altKey &&
          k.shift === this.event.shiftKey &&
          k.key === this.event.key.toLowerCase()
        );
      });
      if (matched) {
        this.stopEvent();
        eventTrigger(matched[1]);
      }
    }
  }

  document.addEventListener('keydown', (e) => {
    if (
      ['INPUT', 'TEXTAREA'].includes(e.target.tagName) ||
      e.target.isContentEditable
    ) {
      return;
    }

    new Key(e)
      .bind('c-[', 'track prev')
      .bind('c-]', 'track next')
      .bind('s-{', 'rate down')
      .bind('s-}', 'rate up')
      .bind('s-backspace', 'rate resume')
      .bind('s-"', 'picture in picture')
      .bind('s-enter', 'page fullscreen')
      .bind('c-s-enter', 'fullscreen')
      .boot();
  });
})();

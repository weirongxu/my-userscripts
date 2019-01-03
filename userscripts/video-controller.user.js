// ==UserScript==
// @name         video controller
// @namespace    https://github.com/weirongxu/my-userscripts
// @version      0.6.1
// @description  video controller
// @author       Raidou
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
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
        transition: all .5s;
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
    const $roots = document.querySelectorAll('body, :-webkit-full-screen');
    const $root = $roots[$roots.length - 1];
    let $info = $root.querySelector(`.${cls}`);
    if (!$info) {
      $root.insertAdjacentHTML('beforeend', `<div class="${cls}"></div>`);
      $info = $root.querySelector(`.${cls}`);
    }
    $info.innerHTML = info;
    setStyle($info, {
      left: rect.left + video.clientWidth / 2 - $info.clientWidth / 2 + 'px',
      top: rect.top + video.clientHeight / 2 - $info.clientHeight / 2 + 'px'
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
      matches = $elem => $elem.matches(selector);
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
    $elems.forEach(elem => {
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
    if ($elem) {
      $elem.click();
    }
  }

  function eventTrigger(eventName) {
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
                eventName
              }
            },
            '*'
          );
        }
      }
    }

    switch (eventName) {
      case 'rate down':
        existsVideo(video => {
          video.playbackRate -= 0.05;
          showInfo(video, `rate: ${video.playbackRate.toFixed(2)}`);
        })
        break;
      case 'rate up':
        existsVideo(video => {
          video.playbackRate += 0.05;
          showInfo(video, `rate: ${video.playbackRate.toFixed(2)}`);
        })
        break;
      case 'rate resume':
        existsVideo(video => {
          video.playbackRate = 1;
          showInfo(video, `rate: ${video.playbackRate.toFixed(2)}`);
        })
        break;
      case 'picture in picture':
        existsVideo(video => {
          if (video !== document.pictureInPictureElement) {
            video.requestPictureInPicture();
          } else {
            document.exitPictureInPicture();
          }
        })
        break;
      case 'page fullscreen':
        click(
          document.querySelector(
            [
              '.bilibili-player-video-btn.bilibili-player-video-btn-fullscreen [name=web_fullscreen]'
            ].join(',')
          )
        );
        break;
      case 'fullscreen':
        click(
          document.querySelector(
            [
              '.bilibili-player-video-btn.bilibili-player-video-btn-fullscreen [name=browser_fullscreen]',
              '.ytp-fullscreen-button'
            ].join(',')
          )
        );
        break;
    }
  }

  window.addEventListener('message', event => {
    if (event.data.videoController && event.data.videoController.eventName) {
      eventTrigger(event.data.videoController.eventName);
    }
  });

  document.addEventListener('keydown', e => {
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
      return;
    }
    const stopEvent = () => {
      e.preventDefault();
      e.stopPropagation();
    };
    if (e.shiftKey) {
      switch (e.key) {
        case '{':
          stopEvent();
          eventTrigger('rate down');
          return;
        case '}':
          stopEvent();
          eventTrigger('rate up');
          return;
        case 'Backspace':
          stopEvent();
          eventTrigger('rate resume');
          return;
        case '"':
          stopEvent();
          eventTrigger('picture in picture');
          return;
        case 'Enter':
          stopEvent();
          if (e.ctrlKey) {
            eventTrigger('fullscreen');
          } else {
            eventTrigger('page fullscreen');
          }
          return;
      }
    }
  });
})();

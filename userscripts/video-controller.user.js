// ==UserScript==
// @name         video controller
// @namespace    https://github.com/weirongxu/my-userscripts
// @version      0.5.0
// @description  video controller
// @author       Raidou
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  function setStyle($node, css) {
    Object.entries(css).forEach(([key, val]) => {
      $node.style[key] = val;
    });
  }

  let infoTimer = null;
  function showInfo(video, info) {
    const rect = video.getBoundingClientRect();
    const cls = 'video-controller-info';
    const $roots = document.querySelectorAll('body, :-webkit-full-screen');
    const $root = $roots[$roots.length-1];
    let $info = $root.querySelector(`.${cls}`);
    if (! $info) {
      $root.insertAdjacentHTML('beforeend', `<div class="${cls}"></div>`);
      $info = $root.querySelector(`.${cls}`);
    }
    setStyle($info, {
      background: 'rgba(0, 0, 0, 0.5)',
      color: 'white',
      padding: '5px',
      zIndex: 1000000000,
      borderRadius: '5px',
      fontSize: '12px',
      position: 'fixed',
      opacity: 0,
      transition: '.5s opacity',
    });
    $info.innerHTML = info;
    $info.style.left = rect.left + video.clientWidth/2 - $info.clientWidth/2 + 'px';
    $info.style.top = rect.top + video.clientHeight/2 - $info.clientHeight/2 + 'px';
    $info.style.opacity = 1;
    clearTimeout(infoTimer);
    infoTimer = setTimeout(() => {
      $info.style.opacity = 0;
    }, 600);
  }

  function inView($doms) {
    let maxVisibleArea = 0;
    let winningDom = null;
    $doms.forEach((dom) => {
      const rect = dom.getBoundingClientRect();
      const left = Math.max(rect.left, 0);
      const top = Math.max(rect.top, 0);
      const right = Math.min(rect.right, window.innerWidth);
      const bottom = Math.min(rect.bottom, window.innerHeight);
      const visibleArea = (right-left) * (bottom-top);
      if (visibleArea > maxVisibleArea) {
        maxVisibleArea = visibleArea;
        winningDom = dom;
      }
    });
    return winningDom;
  }

  function videoInView() {
    return inView(document.querySelectorAll('video'));
  }

  function iframeInView() {
    return inView(document.querySelectorAll('iframe'));
  }

  function eventTrigger(eventName) {
    const video = videoInView();
    if (! video) {
      const iframe = iframeInView();
      if (iframe) {
        iframe.contentWindow.postMessage({
          videoController: {
            eventName,
          }
        }, '*')
      }
      return;
    }

    switch (eventName) {
      case 'rate down':
        video.playbackRate -= 0.05;
        showInfo(video, `rate: ${video.playbackRate.toFixed(2)}`);
        break;
      case 'rate up':
        video.playbackRate += 0.05;
        showInfo(video, `rate: ${video.playbackRate.toFixed(2)}`);
        break;
      case 'rate resume':
        video.playbackRate = 1;
        showInfo(video, `rate: ${video.playbackRate.toFixed(2)}`);
        break;
      case 'picture in picture':
        if (video !== document.pictureInPictureElement) {
          video.requestPictureInPicture();
        } else {
          document.exitPictureInPicture();
        }
        break;
    }
  }

  window.addEventListener('message', (event) => {
    if (event.data.videoController && event.data.videoController.eventName) {
      eventTrigger(event.data.videoController.eventName);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
      return;
    }
    const stopEvent = () => {
      e.preventDefault();
      e.stopPropagation();
    }
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
      }
    }
  });
})();

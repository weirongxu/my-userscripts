// ==UserScript==
// @name         video controller
// @namespace    https://github.com/weirongxu/my-userscripts
// @version      0.4.1
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

  function videoInView() {
    const $video = document.querySelectorAll('video');
    let maxVisibleArea = 0;
    let video = null;
    $video.forEach((_video) => {
      const rect = _video.getBoundingClientRect();
      const left = Math.max(rect.left, 0);
      const top = Math.max(rect.top, 0);
      const right = Math.min(rect.right, window.innerWidth);
      const bottom = Math.min(rect.bottom, window.innerHeight);
      const visibleArea = (right-left) * (bottom-top);
      if (visibleArea > maxVisibleArea) {
        maxVisibleArea = visibleArea;
        video = _video;
      }
    });
    return video;
  }

  document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
      return;
    }
    const stopEvent = () => {
      e.preventDefault();
      e.stopPropagation();
    }
    if (e.shiftKey) {
      const video = videoInView();
      if (! video) {
        return;
      }
      switch (e.key) {
        case '{':
          stopEvent();
          video.playbackRate -= 0.05;
          showInfo(video, `rate: ${video.playbackRate.toFixed(2)}`);
          return;
        case '}':
          stopEvent();
          video.playbackRate += 0.05;
          showInfo(video, `rate: ${video.playbackRate.toFixed(2)}`);
          return;
        case 'Backspace':
          stopEvent();
          video.playbackRate = 1;
          showInfo(video, `rate: ${video.playbackRate.toFixed(2)}`);
          return;
        case '"':
          stopEvent();
          if (video !== document.pictureInPictureElement) {
            video.requestPictureInPicture();
          } else {
            document.exitPictureInPicture();
          }
          return;
      }
    }
  });
})();

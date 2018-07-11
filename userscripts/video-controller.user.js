// ==UserScript==
// @name         video controller
// @namespace    https://github.com/weirongxu/my-userscripts
// @version      0.2.0
// @description  video controller
// @author       Raidou
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict'

  function setStyle($node, css) {
    Object.entries(css).forEach(([key, val]) => {
      $node.style[key] = val
    })
  }

  let infoTimer = null
  function showInfo(video, info) {
    const rect = video.getBoundingClientRect()
    const id = 'video-change-play-rate-info'
    let $info = document.querySelector(`#${id}`)
    if (! $info) {
      document.body.insertAdjacentHTML('beforeend', `<div id="${id}"></div>`)
      $info = document.body.querySelector(`#${id}`)
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
    })
    $info.innerHTML = info
    $info.style.left = rect.left + video.clientWidth/2 - $info.clientWidth/2 + 'px'
    $info.style.top = rect.top + video.clientHeight/2 - $info.clientHeight/2 + 'px'
    $info.style.opacity = 1
    clearTimeout(infoTimer)
    infoTimer = setTimeout(() => {
      $info.style.opacity = 0
    }, 600)
  }

  function videoInView() {
    const $video = document.querySelectorAll('video')
    let maxVisibleArea = 0
    let video = null
    $video.forEach((_video) => {
      const rect = _video.getBoundingClientRect()
      const left = Math.max(rect.left, 0)
      const top = Math.max(rect.top, 0)
      const right = Math.min(rect.right, window.innerWidth)
      const bottom = Math.min(rect.bottom, window.innerHeight)
      const visibleArea = (right-left) * (bottom-top)
      if (visibleArea > maxVisibleArea) {
        maxVisibleArea = visibleArea
        video = _video
      }
    })
    return video
  }

  document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
      return true
    }
    if (e.shiftKey) {
      const video = videoInView()
      if (! video) {
        return true
      }
      switch (e.key) {
        case '{':
          video.playbackRate -= 0.05
          showInfo(video, `rate: ${video.playbackRate.toFixed(2)}`)
          return false
        case '}':
          video.playbackRate += 0.05
          showInfo(video, `rate: ${video.playbackRate.toFixed(2)}`)
          return false
        case 'Backspace':
          video.playbackRate = 1
          showInfo(video, `rate: ${video.playbackRate.toFixed(2)}`)
          return false
      }
    }
  })
})()

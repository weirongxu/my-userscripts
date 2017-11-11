// ==UserScript==
// @name         video change play rate
// @namespace    https://gist.github.com/weirongxu/c0d241ff3d94b2140570bf56124b382a
// @version      0.1
// @description  video change play rate
// @author       Raidou
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
'use strict'

var script = document.createElement("script")
script.setAttribute("src", "//code.jquery.com/jquery-2.2.4.min.js")
script.addEventListener('load', () => {
  main(jQuery.noConflict(true))
}, false)
document.body.appendChild(script)

function main($) {
  let infoTimer = null
  function showInfo(video, info) {
    const rect = video.getBoundingClientRect()
    const id = 'video-change-play-rate-info'
    let $info = $(`#${id}`)
    if (! $info.length) {
      $info = $('body').append(`<div id="${id}"></div>`).find(`#${id}`)
    }
    $info.css({
      background: 'rgba(0, 0, 0, 0.5)',
      color: 'white',
      padding: '5px',
      zIndex: 1000000000,
      borderRadius: '5px',
      fontSize: '12px',
      position: 'fixed',
    })
    $info.html(info)
    $info.css({
      left: rect.left + video.clientWidth/2 - $info.width()/2 + 'px',
      top: rect.top + video.clientHeight/2 - $info.height()/2 + 'px',
    })
    $info.fadeIn()
    clearTimeout(infoTimer)
    infoTimer = setTimeout(() => {
      $info.fadeOut()
    }, 600)
  }

  function videoInView() {
    const $video = $('video')
    let maxVisibleArea = 0
    let video = null
    $video.toArray().forEach((_video) => {
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

  $(document).on('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
      return true
    }
    if (e.shiftKey) {
      const video = videoInView()
      if (! video) {
        return true
      }
      switch (e.key) {
        case '[':
          video.playbackRate -= 0.05
          showInfo(video, `rate: ${video.playbackRate.toFixed(2)}`)
          return false
        case ']':
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
}
})()

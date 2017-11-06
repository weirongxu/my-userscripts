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

function showInfo($video, info) {
  video = $video[0]
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
  })
  $info.html(info)
  $info.css({
    position: 'fixed',
    left: rect.left + video.clientWidth/2 - $info.width()/2 + 'px',
    top: rect.top + video.clientHeight/2 - $info.height()/2 + 'px',
  })
}

function main($) {
  $(document).on('keydown', (e) => {
    if (e.ctrlKey) {
      const $video = $('video')
      switch (e.key.toLowerCase()) {
        case '[':
          $video.each(function() {
            this.playbackRate -= 0.05
            showInfo($video, `rate: ${this.playbackRate.toFixed(2)}`)
          })
          return false
        case ']':
          $video.each(function() {
            this.playbackRate += 0.05
            showInfo($video, `rate: ${this.playbackRate.toFixed(2)}`)
          })
          return false
        case 'backspace':
          $video.each(function() {
            this.playbackRate = 1
            showInfo($video, `rate: ${this.playbackRate.toFixed(2)}`)
          })
          return false
      }
    }
  })
}
})()

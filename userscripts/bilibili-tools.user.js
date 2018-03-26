// ==UserScript==
// @name         bilibili tools
// @namespace    https://github.com/weirongxu/my-userscripts
// @version      0.1
// @description  try to take over the world!
// @author       Raidou
// @match        *://*.bilibili.com/*
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

function click($elem, event) {
  if ($elem.length) {
    $elem[0].click()
  }
}

const $curPlayerItem = () =>
  $('.bilibili-player .bilibili-player-auxiliary-area .bilibili-player-watchlater-item[data-state-play=true]')

function main($) {
  $(document).on('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
      return true
    }
    if (e.shiftKey) {
      switch (e.key) {
        case 'ArrowLeft':
          click($curPlayerItem().prev().find('.bilibili-player-watchlater-item-sup'))
          return false
        case 'ArrowRight':
          click($curPlayerItem().next().find('.bilibili-player-watchlater-item-sup'))
          return false
        case 'ArrowUp':
          click($curPlayerItem().find('.bilibili-player-watchlater-part-item[data-state-play=true]').prev())
          return false
        case 'ArrowDown':
          click($curPlayerItem().find('.bilibili-player-watchlater-part-item[data-state-play=true]').next())
          return false
        case 'Enter':
          click($('.bilibili-player-video-web-fullscreen, .bilibili-live-player-video-controller-web-fullscreen-btn button'))
          return false
        case '|':
          click($curPlayerItem().find('.bilibili-player-watchlater-info-remove.bilibili-player-fr.player-tooltips-trigger'))
          return false
      }
    } else if (! (e.metaKey || e.altKey || e.ctrlKey)) {
      switch(e.key) {
        case 'ArrowLeft':
          $('.bilibili-player-video video')[0].currentTime -= 5
          return false
        case 'ArrowRight':
          $('.bilibili-player-video video')[0].currentTime += 5
          return false
      }
    }
  })
}
})()

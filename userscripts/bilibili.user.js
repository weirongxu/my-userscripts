// ==UserScript==
// @name         bilibili
// @namespace    https://github.com/weirongxu/my-userscripts
// @version      0.3.2
// @description  try to take over the world!
// @author       Raidou
// @match        *://*.bilibili.com/*
// @grant        none
// ==/UserScript==

(function() {
'use strict'

function click($elem, event) {
  if ($elem) {
    $elem.click()
  }
}

const $curPlayerItem = () =>
  document.querySelector('.bilibili-player .bilibili-player-auxiliary-area .bilibili-player-watchlater-item[data-state-play=true]')

document.addEventListener('keydown', (e) => {
  if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
    return
  }
  if (e.shiftKey) {
    switch (e.key) {
      case 'ArrowLeft':
        click($curPlayerItem().previousSibling.querySelector('.bilibili-player-watchlater-item-sup'))
        return e.preventDefault()
      case 'ArrowRight':
        click($curPlayerItem().nextSibling.querySelector('.bilibili-player-watchlater-item-sup'))
        return e.preventDefault()
      case 'ArrowUp':
        click($curPlayerItem().querySelector('.bilibili-player-watchlater-part-item[data-state-play=true]').previousSibling)
        return e.preventDefault()
      case 'ArrowDown':
        click($curPlayerItem().querySelector('.bilibili-player-watchlater-part-item[data-state-play=true]').nextSibling)
        return e.preventDefault()
      case 'Enter':
        click(document.querySelector('.bilibili-player-video-web-fullscreen, .bilibili-live-player-video-controller-web-fullscreen-btn button'))
        return e.preventDefault()
      case '|':
        click($curPlayerItem().querySelector('.bilibili-player-watchlater-info-remove.bilibili-player-fr.player-tooltips-trigger'))
        return e.preventDefault()
      case 'P':
        click($curPlayerItem().previousSibling.querySelector('.bilibili-player-watchlater-info-remove.bilibili-player-fr.player-tooltips-trigger'))
        return e.preventDefault()
    }
  } else if (! (e.metaKey || e.altKey || e.ctrlKey)) {
    switch(e.key) {
      case 'ArrowLeft':
        document.querySelector('.bilibili-player-video video').currentTime -= 5
        return false
      case 'ArrowRight':
        document.querySelector('.bilibili-player-video video').currentTime += 5
        return false
    }
  }
})

})()

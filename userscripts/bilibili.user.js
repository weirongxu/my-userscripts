// ==UserScript==
// @name         bilibili
// @namespace    https://github.com/weirongxu/my-userscripts
// @version      0.3.4
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
  const stopEvent = () => {
    e.preventDefault()
    e.stopPropagation()
  }
  if (e.shiftKey) {
    switch (e.key) {
      case 'ArrowLeft':
        stopEvent()
        click($curPlayerItem().previousSibling.querySelector('.bilibili-player-watchlater-item-sup'))
        return
      case 'ArrowRight':
        stopEvent()
        click($curPlayerItem().nextSibling.querySelector('.bilibili-player-watchlater-item-sup'))
        return
      case 'ArrowUp':
        stopEvent()
        click($curPlayerItem().querySelector('.bilibili-player-watchlater-part-item[data-state-play=true]').previousSibling)
        return
      case 'ArrowDown':
        stopEvent()
        click($curPlayerItem().querySelector('.bilibili-player-watchlater-part-item[data-state-play=true]').nextSibling)
        return
      case 'Enter':
        stopEvent()
        click(document.querySelector('.bilibili-player-video-web-fullscreen, .bilibili-live-player-video-controller-web-fullscreen-btn button'))
        return
      case '|':
        stopEvent()
        click($curPlayerItem().querySelector('.bilibili-player-watchlater-info-remove.bilibili-player-fr.player-tooltips-trigger'))
        return
      case 'P':
        stopEvent()
        click($curPlayerItem().previousSibling.querySelector('.bilibili-player-watchlater-info-remove.bilibili-player-fr.player-tooltips-trigger'))
        return
    }
  } else if (! (e.metaKey || e.altKey || e.ctrlKey)) {
    switch(e.key) {
      case 'ArrowLeft':
        document.querySelector('.bilibili-player-video video').currentTime -= 5
        return
      case 'ArrowRight':
        document.querySelector('.bilibili-player-video video').currentTime += 5
        return
    }
  }
})

})()

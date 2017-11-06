// ==UserScript==
// @name         bilibili watchlater tools
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       Raidou
// @match        *://*.bilibili.com/watchlater/*
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

function main($) {
  $(document).on('keydown', (e) => {
    if (e.shiftKey) {
      const $curItem = $('.bilibili-player .bilibili-player-auxiliary-area .bilibili-player-watchlater-item[data-state-play=true]')
      switch (e.key) {
        case 'ArrowLeft':
          click($curItem.prev().find('.bilibili-player-watchlater-item-sup'))
          return false
        case 'ArrowRight':
          click($curItem.next().find('.bilibili-player-watchlater-item-sup'))
          return false
        case 'ArrowUp':
          click($curItem.find('.bilibili-player-watchlater-part-item[data-state-play=true]').prev())
          return false
        case 'ArrowDown':
          click($curItem.find('.bilibili-player-watchlater-part-item[data-state-play=true]').next())
          return false
        case 'Backspace':
          click($curItem.find('.bilibili-player-watchlater-info-remove.bilibili-player-fr.player-tooltips-trigger'))
          return false
      }
    }
  })
}
})()

// ==UserScript==
// @name         bilibili
// @namespace    https://github.com/weirongxu/my-userscripts
// @version      0.4.0
// @description  try to take over the world!
// @author       Raidou
// @match        *://*.bilibili.com/*
// @grant        none
// ==/UserScript==

(function() {
'use strict';

history.pushState = (f => function pushState(){
  const ret = f.apply(this, arguments);
  window.dispatchEvent(new Event('pushState'));
  window.dispatchEvent(new Event('locationchange'));
  return ret;
})(history.pushState);

history.replaceState = (f => function replaceState(){
  const ret = f.apply(this, arguments);
  window.dispatchEvent(new Event('replaceState'));
  window.dispatchEvent(new Event('locationchange'));
  return ret;
})(history.replaceState);

window.addEventListener('popstate', () => {
  window.dispatchEvent(new Event('locationchange'))
});

function click($elem, event) {
  if ($elem) {
    $elem.click()
  }
}

const $curPlayerItem = () =>
  document.querySelector('.bilibili-player .bilibili-player-auxiliary-area .bilibili-player-watchlater-item[data-state-play=true]');

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
      case 'ArrowLeft':
        stopEvent();
        click($curPlayerItem().previousSibling.querySelector('.bilibili-player-watchlater-item-sup'));
        return;
      case 'ArrowRight':
        stopEvent();
        click($curPlayerItem().nextSibling.querySelector('.bilibili-player-watchlater-item-sup'));
        return;
      case 'ArrowUp':
        stopEvent();
        click($curPlayerItem().querySelector('.bilibili-player-watchlater-part-item[data-state-play=true]').previousSibling);
        return;
      case 'ArrowDown':
        stopEvent();
        click($curPlayerItem().querySelector('.bilibili-player-watchlater-part-item[data-state-play=true]').nextSibling);
        return;
      case 'Enter':
        stopEvent();
        click(document.querySelector('.bilibili-player-video-web-fullscreen, .bilibili-live-player-video-controller-web-fullscreen-btn button'));
        return;
      case '|':
        stopEvent();
        click($curPlayerItem().querySelector('.bilibili-player-watchlater-info-remove.bilibili-player-fr.player-tooltips-trigger'));
        return;
      case 'P':
        stopEvent();
        click($curPlayerItem().previousSibling.querySelector('.bilibili-player-watchlater-info-remove.bilibili-player-fr.player-tooltips-trigger'));
        return;
    }
  } else if (! (e.metaKey || e.altKey || e.ctrlKey)) {
    switch(e.key) {
      case 'ArrowLeft':
        document.querySelector('.bilibili-player-video video').currentTime -= 5;
        return;
      case 'ArrowRight':
        document.querySelector('.bilibili-player-video video').currentTime += 5;
        return;
    }
  }
});

const bind = () => {
  if (location.href === 'https://t.bilibili.com/?tab=8') {
    const cardSeeLater = ($card) => {
      const $later = $card.querySelector('.see-later');
      if (! $later.matches('.done')) {
        click($later);
      }
    };
    const cardSeeLaterAbove = ($card) => {
      cardSeeLater($card);
      const $prevCard = $card.previousElementSibling;
      if ($prevCard) {
        cardSeeLaterAbove($prevCard);
      }
    };

    document.querySelector('.card-list .content').addEventListener('mouseover', (e) => {
      const $card = e.target;
      if ($card.matches('.card')) {
        if (! e.target.querySelector('.see-later-above')) {
          e.target.querySelector('.button-bar.tc-slate').insertAdjacentHTML('afterend', `
            <span class="see-later-above">see later above</span>
          `);
          e.target.querySelector('.see-later-above').addEventListener('click', () => {
            cardSeeLaterAbove($card)
          });
        }
      }
    });
  }
}

window.addEventListener('locationchange', function(){
  setTimeout(bind, 5000)
});

setTimeout(bind, 5000)

})();

// ==UserScript==
// @name         aria2 WebUI auto restart
// @namespace    https://github.com/weirongxu/my-userscripts
// @version      0.4.1
// @description  aria2 WebUI auto restart!
// @author       Raidou
// @require      https://code.jquery.com/jquery-2.2.4.min.js
// @match        *://ziahamza.github.io/webui-aria2*
// @grant        none
// ==/UserScript==

(async function() {
  'use strict'

  function confirmTrue(fn) {
    return new Promise((resolve, reject) => {
      const confirm = window.confirm
      window.confirm = () => {
        window.confirm = confirm
        resolve()
        return true
      }
      fn()
    })
  }

  function wait(time) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve()
      }, time)
    })
  }

  async function check() {
    while(true) {
      const errors = $('.download').toArray().map((download) => {
        const $download = $(download)
        return {
          $: $download,
          $errorStats: $download.find('.download-overview li.label-danger'),
        }
      }).filter((obj) => {
        const $stats = obj.$errorStats
        return $stats.find('span[title="Error"]').length || $stats.find('span[title="出错的"]').length
      })
      if (! errors.length) {
        return
      }
      const conf = errors[0]
      if (conf.$errorStats.text().trim().includes('file already existed')) {
        await confirmTrue(() => {
          conf.$.find('[ng-click="remove(download)"]').click()
        })
      } else {
        conf.$.find('[ng-click="restart(download)"]').click()
      }
      await wait(100)
    }
  }

  async function loop() {
    await check()
    await wait(20000)
    loop()
  }

  await wait(2000)
  loop()
})()

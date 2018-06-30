// ==UserScript==
// @name         huaban
// @namespace    https://github.com/weirongxu/my-userscripts
// @version      0.2.2
// @description  花瓣添加到练习中
// @author       Raidou
// @match        *://huaban.com/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict'

  const watch = ($els, selector, once, callback) => {
    if ($els) {
      const done = (targets) => {
        if (once === true) {
          observer.disconnect()
        }
        callback(targets)
      }
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (selector) {
            if (mutation.addedNodes.length) {
              let targets
              const node = mutation.addedNodes[0]
              if (node.matches(selector)) {
                targets = [node]
              } else {
                targets = node.querySelectorAll(selector)
              }
              if (targets.length) {
                done(targets)
              }
            }
          } else {
            done()
          }
        })
      })
      $els.forEach(($el) => {
        observer.observe($el, {
          childList: true,
        })
      })
    }
  }

  const xhr = async (method, url, body=null) => {
    const options = {
      method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Accept': 'application/json',
        'X-Request': 'JSON',
        'X-Requested-With': 'XMLHttpRequest',
      },
    }
    if (method !== 'get') {
      const form = new URLSearchParams()

      for (const key in body) {
        form.set(key, body[key])
      }
      options.body = form
    }
    const res = await fetch(url, options)
    return res.json()
  }

  const message = (msg, status='success') => {
    let box = document.querySelector('#floating_notice_box')
    if (! box) {
      document.body.insertAdjacentHTML('afterbegin', '<div id="floating_notice_box"></div>')
      box = document.querySelector('#floating_notice_box')
    }
    const id = `uniq_${Date.now()}`
    box.insertAdjacentHTML(
      'beforeend',
      `<div
        id="${id}"
        class="floating-notice fixed-width"
        style="margin-left: -270px; opacity: 1;">
        <i class="icon-${status}"></i>${msg}
      </div>`
    )
    setTimeout(() => {
      box.querySelector(`#${id}`).remove()
    }, 5000)
  }

  const bind = (targets) => {
    const pinView = document.querySelector('.pin-view')
    if (pinView) {
      const toolBar = pinView.querySelector('.tool-bar')
      let addTraining = toolBar.querySelector('.add-training')
      if (! addTraining) {
        toolBar.insertAdjacentHTML(
          'afterbegin',
          `<a class="add-training edit-btn btn" href="#">
            <span className="text">练习</span>
          </a>`
        )
        addTraining = toolBar.querySelector('.add-training')
      }
      addTraining.addEventListener('click', (event) => {
        event.preventDefault()
        ;(async () => {
          const text = pinView.querySelector('.info-piece.piece').textContent
          const pinId = parseInt(pinView.getAttribute('data-id'))
          const boardId = 45259625
          const ret = await xhr('get', `https://huaban.com/pins/${pinId}/repin/?check=true`)
          if (ret.exist_pin.board_id !== boardId) {
            const ret = await xhr('post', `https://huaban.com/pins/`, {
              board_id: boardId,
              text,
              via: pinId,
              share_button: '0',
            })
            if (ret.err) {
              message(ret.msg, 'error')
            } else {
              message(`已采集到画板：<a href="/boards/${ret.pin.board_id}">${ret.pin.board.title}</a>
              <div class="right"><a href="/pins/${ret.pin.pin_id}">查看采集</a></div>`)
            }
          } else {
            message('画板中已经存在这个采集', 'error')
          }
        })()
      })
    }
  }

  bind(document.querySelectorAll('.image-piece.piece'))

  watch(document.querySelectorAll('body'), '.image-piece.piece', false, bind)
})()

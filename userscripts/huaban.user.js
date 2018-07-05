// ==UserScript==
// @name         huaban
// @namespace    https://github.com/weirongxu/my-userscripts
// @version      0.2.5
// @description  花瓣添加到练习中
// @author       Raidou
// @match        *://huaban.com/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict'

  const waitFn = (fn, maxCount=20, timeout=500) => {
    let count = 0
    return new Promise((resolve, reject) => {
      const check = async () => {
        if (await fn()) {
          resolve()
        } else {
          count ++
          if (count < maxCount) {
            setTimeout(check, timeout)
          } else {
            reject()
          }
        }
      }
      check()
    })
  }

  const waitFor = async ($el, selector, maxCount=20, timeout=500) => {
    let $waitEl
    await waitFn(() => {
      return $waitEl = $el.querySelector(selector)
    }, maxCount, timeout)
    return $waitEl
  }

  const watch = ($els, config={}, callback=() => {}) => {
    if (typeof config === 'function') {
      callback = config
      config = {}
    }
    config = Object.assign({
      immediate: false,
      once: false,
      selector: null,
    }, config)

    const done = (target) => {
      if (config.once === true) {
        observer.disconnect()
      }
      callback(target)
    }
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (config.selector) {
          if (mutation.addedNodes.length) {
            let targets
            const node = mutation.addedNodes[0]
            if (node.matches(config.selector)) {
              targets = [node]
            } else {
              targets = node.querySelectorAll(config.selector)
            }
            targets.forEach(done)
          }
        } else {
          done()
        }
      })
    })
    $els.forEach(($el) => {
      if (config.immediate) {
        if (config.selector) {
          $el.querySelectorAll(config.selector).forEach(done)
        } else {
          done()
        }
      }

      observer.observe($el, {
        childList: true,
      })
    })
    return () => {
      observer.disconnect()
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

  const insertUnique = ($el, position, selector, html) => {
    const getInsert = () => {
      switch (position) {
        case 'beforebegin':
          return $el.previousSibling.matches(selector) ?
            $el.previousSibling : null
        case 'afterend':
          return $el.nextSibling.matches(selector) ?
            $el.nextSibling : null
        default:
          return $el.querySelector(selector)
      }
    }
    let $child = getInsert()
    if (! $child) {
      $el.insertAdjacentHTML(position, html)
      return getInsert()
    }
    return $child
  }

  const message = (msg, status='success') => {
    const $box = insertUnique(
      document.body,
      'afterbegin',
      '#floating_notice_box',
      `<div id="floating_notice_box"></div>`
    )
    const id = `uniq_${Date.now()}`
    $box.insertAdjacentHTML(
      'beforeend',
      `<div
        id="${id}"
        class="floating-notice fixed-width"
        style="margin-left: -270px; opacity: 1;">
        <i class="icon-${status}"></i>${msg}
      </div>`
    )
    setTimeout(() => {
      $box.querySelector(`#${id}`).remove()
    }, 5000)
  }

  const paths = ($el, _paths='') => {
    if (! $el) return _paths
    let cls = ''
    const name = $el.tagName.toLowerCase()
    if (! ['html', 'body'].includes(name) && $el.classList.length) {
      cls = '.' + Array.from($el.classList).join('.')
    }
    return paths($el.parentElement, `${name}${cls}/${_paths}`)
  }

  const addToTraining = async (pinId, text) => {
    const boardId = 45259625
    const ret = await xhr('get', `https://huaban.com/pins/${pinId}/repin/?check=true`)
    if (! ret || ! ret.exist_pin || ret.exist_pin.board_id !== boardId) {
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
  }

  const bindDetails = async ($pinView) => {
    if (! $pinView) return

    const $toolBar = await waitFor($pinView, '.tool-bar')
    const $btn = insertUnique(
      $toolBar,
      'afterbegin',
      '.add-training',
      `<a class="add-training edit-btn btn" href="#">
        <span className="text">练习</span>
      </a>`
    )
    $btn.addEventListener('click', (event) => {
      event.preventDefault()
      const pinId = parseInt($pinView.getAttribute('data-id'))
      const text = (() => {
        const $desc = $pinView.querySelector('.description')
        return $desc ? $desc.textContent : ''
      })()
      addToTraining(pinId, text).catch(console.error)
    })
  }

  const bindWaterfall = async ($pin) => {
    const $actions = await waitFor($pin, '.actions')
    const $btn = insertUnique(
      $actions,
      'beforeend',
      '.add-training',
      `<div class="left add-training" style="top: 40px;">
        <a href="#" class="edit btn btn14">
          <span class="text">练习</span>
        </a>
      </div>`
    )
    $btn.addEventListener('click', (event) => {
      event.preventDefault()
      const pinId = parseInt($pin.getAttribute('data-id'))
      const text = (() => {
        const $desc = $pin.querySelector('.description')
        return $desc ? $desc.textContent : ''
      })()
      addToTraining(pinId, text).catch(console.error)
    })
  }

  let waterfallWatcher
  const bind = async () => {
    const url = location.href
    if ([
      /huaban.com\/$/,
      /huaban.com\/boards\/\d+\/$/,
    ].some(re => re.test(url))) {
      const $waterfall = await waitFor(document, '#waterfall')
      if (waterfallWatcher) waterfallWatcher()
      waterfallWatcher = watch(
        [$waterfall],
        {
          selector: '.pin',
          immediate: true,
        },
        $pin => {bindWaterfall($pin)}
      )
    } else if (/huaban.com\/pins\/\d+\/$/.test(url)) {
      const $pinView = await waitFor(document, '.pin-view')
      bindDetails($pinView)
    }
  }

  const onChangeState = (callback) => {
    const history = window.history
    const pushState = history.pushState
    history.pushState = function(...args) {
      callback()
      pushState.apply(history, args)
    }
    const replaceState = history.replaceState
    history.pushState = function(...args) {
      callback()
      replaceState.apply(history, args)
    }
    window.addEventListener('popstate', (event) => {
      callback()
    })
  }

  onChangeState(() => {
    setTimeout(bind, 2000)
  })
  bind()
})()

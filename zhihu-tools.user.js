// ==UserScript==
// @name         zhihu tools
// @namespace    https://gist.github.com/weirongxu/c0d241ff3d94b2140570bf56124b382a
// @version      0.1
// @description  zhihu tools
// @author       Raidou
// @match        *://*.zhihu.com/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
'use strict'

const fnName = `ZhihuTools_${Number(new Date())}`

function XHR(options) {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      ...options,
      onload(res) {
        resolve(res)
      },
      onerror(err) {
        reject(res)
      },
    })
  })
}

(async () => {
  const [
    jquery,
    jsCookie,
  ] = await Promise.all([
    'https://code.jquery.com/jquery-2.2.4.min.js',
  ].map(url => XHR({
    method: 'GET',
    url,
  })))
  eval(`
    ${jquery.response};
    ${fnName}(jQuery.noConflict(true));
  `)
})()


class Zhihu {
  constructor($) {
    this.$ = $
    this.headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }

  async get(url) {
    const res = await fetch(url, {
      method: 'GET',
      headers: this.headers,
    })
    return await res.json()
  }

  async post(url, body) {
    const res = await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body)
    })
    return await res.json()
  }

  watch($dom, selector, once, callback) {
    if ($dom.length) {
      const done = ($target) => {
        if (once === true) {
          observer.disconnect()
        }
        callback($target)
      }
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (selector) {
            let $target = this.$(mutation.addedNodes[0]).filter(selector)
            if (! $target.length) {
              $target = this.$(mutation.addedNodes[0]).find(selector)
            }
            if ($target.length) {
              done($target)
            }
          } else {
            done()
          }
        })
      })
      $dom.each(function() {
        observer.observe(this, {
          childList: true,
        })
      })
    }
  }

  async boot() {
    const $ = this.$
    switch (location.host) {
      case 'www.zhihu.com':
        this.home($)
        break
      case 'zhuanlan.zhihu.com':
        this.zhuanlan($)
        break
    }
  }

  get readLayterId() {
    return 183046846
  }
  async inReadLater(articleId) {
    const collecteds = await this.get(`https://www.zhihu.com/api/v4/articles/${articleId}/relations/collected?favlist_ids=[${this.readLayterId}]`)
    return collecteds[0].collected
  }

  async addToReadLater(articleId) {
    const data = await this.post(`https://www.zhihu.com/api/v4/favlists/${this.readLayterId}/items`, {
      content_id: articleId,
      content_type: 'article',
    })
    if (data.content) {
      return data.content
    } else {
      throw Error('read later error')
    }
  }

  matchArticleId(url) {
    if (! url.toString().startsWith('http')) {
      url = `http:${url}`
    }
    const match = (new URL(url)).pathname.match(/.*\/(.*)/)
    return match[1]
  }

  btnCollected($btn) {
    $btn.css({
      color: 'white',
      background: '#ccc',
    })
  }

  async home($) {
    const html = await (await fetch('https://www.zhihu.com', {
      credentials: 'same-origin'
    })).text()
    const state = JSON.parse($(html).filter('#data').attr('data-state'))
    this.headers = {
      ...{
        'Authorization': `Bearer ${state.token.carCompose}`,
        'X-UDID': state.token.xUDID,
        'X-XSRF-TOKEN': state.token.xsrf,
      },
    }

    this.watch($('body'), '.Menu.PushNotifications-menu', false, ($menu) => {
      const $list = $menu.find('.PushNotifications-list')
      this.watch($list, '.PushNotifications-item', false, async ($item) => {
        const href = $item.find('> span:nth-child(3) a').attr('href')
        if (href.toString().includes('zhuanlan')) {
          $item.append('<span class="read-later Button">Read later</span>')
          const articleId = this.matchArticleId(href)
          const $laterBtn = $item.find('.read-later')
          $laterBtn.css({
            padding: '5px',
            lineHeight: '14px',
            margin: '0 10px',
          })
          if (await this.inReadLater(articleId)) {
            this.btnCollected($laterBtn)
          } else {
            $laterBtn.on('click', async () => {
              await this.addToReadLater(articleId)
              this.btnCollected($laterBtn)
            })
          }
        }
      })
    })
  }

  async zhuanlan($) {
    this.config = JSON.parse($('#clientConfig').val())
    this.headers = {
      ...{
        // z_c0
        'Authorization': `Bearer ${this.config.tokens['Authorization'].join('|')}`,
        // d_c0
        'X-UDID': this.config.tokens['X-UDID'],
        // _xsrf
        'X-XSRF-TOKEN': this.config.tokens['X-XSRF-TOKEN'],
      },
    }

    const articleId = this.matchArticleId(location)
    if (articleId) {
      let css = `
      padding: 18px;
      cursor: pointer;
      `
      const $laterBtn = $('.Navbar-functionality').prepend(
        `<a class="read-later" style="${css}">Read later</a>`).find('.read-later')
      if (await this.inReadLater(articleId)) {
        this.btnCollected($laterBtn)
      } else {
        $laterBtn.on('click', async () => {
          await this.addToReadLater(articleId)
          this.btnCollected($laterBtn)
        })
      }
    }
  }
}

window[fnName] = (...args) => {
  const zhihu = new Zhihu(...args)
  zhihu.boot()
}

})()

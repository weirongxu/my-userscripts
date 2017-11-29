// ==UserScript==
// @name         zhihu tools
// @namespace    https://gist.github.com/weirongxu/c0d241ff3d94b2140570bf56124b382a
// @version      0.1
// @description  zhihu tools
// @author       Raidou
// @match        *://*.zhihu.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
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
    'https://cdnjs.cloudflare.com/ajax/libs/js-cookie/2.2.0/js.cookie.min.js',
  ].map(url => XHR({
    method: 'GET',
    url,
  })))
  eval(`
    ${jquery.response};
    ${jsCookie.response};
    ${fnName}(jQuery.noConflict(true), Cookies);
  `)
})()


class Zhihu {
  constructor($, Cookies) {
    this.$ = $
    this.Cookies = Cookies
    this.headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }

  async get(url, options={}) {
    const res = await fetch(url, {
      method: 'GET',
      headers: this.headers,
      ...options,
    })
    return await res.json()
  }

  async form(url, form, options={}) {
    form._xsrf = Cookies.get('_xsrf')
    return await new Promise((resolve, reject) => {
      this.$.ajax({
        type: 'POST',
        url,
        data: form,
        xhrFields: {
          withCredentials: true,
        },
        success(data, textStatus, xhr) {
          resolve(data)
        },
        error(xhr, textStatus, error) {
          reject(error)
        },
      })
    })
    // const res = await fetch(url, {
    //   method: 'POST',
    //   body: Object.entries(form).reduce((f, [key, value]) => {
    //     f.append(key, value)
    //     return f
    //   }, new FormData()),
    //   headers: {
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //   },
    //   credentials: 'same-origin',
    //   ...options,
    // })
  }

  async post(url, body, options) {
    const res = await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body),
      ...options,
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

  async loadToken() {
     const token = await GM_getValue('my-user-token', false)
     if (token) {
       this.token = JSON.parse(token)
       console.dir(this.token)
       this.headers = {
         ...this.token,
       }
     } else {
       this.token = null
     }
  }

  async setToken(token) {
    await GM_setValue('my-user-token', JSON.stringify(token))
    await this.loadToken()
  }

  async boot() {
    const $ = this.$
    await this.loadToken()

    switch (location.host) {
      case 'www.zhihu.com':
        if (this.token) {
          this.home($)
        }
        break
      case 'zhuanlan.zhihu.com':
        this.zhuanlan($)
        break
    }
  }

  get readLaterId() {
    return 183046846
  }

  async inReadLater(articleId) {
    const collecteds = await this.get(`https://www.zhihu.com/api/v4/articles/${articleId}/relations/collected?favlist_ids=[${this.readLaterId}]`)
    return collecteds[0].collected
  }

  async addReadLater(articleId) {
    const data = await this.post(`https://www.zhihu.com/api/v4/favlists/${this.readLaterId}/items`, {
      content_id: articleId,
      content_type: 'article',
    })
    if (data.content) {
      return data.content
    } else {
      throw Error('add read later error')
    }
  }

  async removeReadLater(articleId) {
    const data = await this.form('https://www.zhihu.com/collection/remove', {
      answer_id: articleId,
      favlist_id: this.readLaterId,
    })
    if (data.msg === 'ok') {
      return data.r
    } else {
      throw Error('remove read later error')
    }
  }

  matchArticleId(url) {
    if (! url.toString().startsWith('http')) {
      url = `http:${url}`
    }
    const match = (new URL(url)).pathname.match(/.*\/(.*)/)
    return match[1]
  }

  btnCollected($btn, isCollected=true) {
    if (isCollected) {
      $btn.css({
        color: 'white',
        background: '#ccc',
      }).data('collected', true)
    } else {
      $btn.removeAttr('style')
        .data('collected', false)
    }
  }

  clickToggleCollect($btn, articleId) {
    $btn.on('click', async () => {
      if ($btn.data('collected')) {
        alert('Doing')
        // TODO
        // await this.removeReadLater(articleId)
        // this.btnCollected($btn, false)
      } else {
        await this.addReadLater(articleId)
        this.btnCollected($btn)
      }
    })
  }

  async home($) {
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
          }
          this.clickToggleCollect($laterBtn, articleId)
        }
      })
    })
  }

  async zhuanlan($) {
    this.config = JSON.parse($('#clientConfig').val())
    await this.setToken({
      // z_c0
      'Authorization': `Bearer ${this.config.tokens['Authorization'].join('|')}`,
      // d_c0
      'X-UDID': this.config.tokens['X-UDID'],
      // _xsrf
      'X-XSRF-TOKEN': this.config.tokens['X-XSRF-TOKEN'],
    })

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
      }
      this.clickToggleCollect($laterBtn, articleId)
    }
  }
}

window[fnName] = (...args) => {
  const zhihu = new Zhihu(...args)
  zhihu.boot()
}

})()

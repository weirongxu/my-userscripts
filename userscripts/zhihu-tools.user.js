// ==UserScript==
// @name         zhihu tools
// @namespace    https://github.com/weirongxu/my-userscripts
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

  async get(url, options={}) {
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: this.headers,
      ...options,
    })
    return await res.json()
  }

  async post(url, body, options) {
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: this.headers,
      body: JSON.stringify(body),
      ...options,
    })
    return await res.json()
  }

  async del(url, body, options) {
    const res = await fetch(url, {
      method: 'DELETE',
      credentials: 'include',
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

  get readLaterId() {
    return 183046846
  }

  async inReadLater(articleId, type) {
    const url = type === 'article' ?
      `https://www.zhihu.com/api/v4/articles/${articleId}/relations/collected?favlist_ids=`
      : `https://www.zhihu.com/api/v4/answers/${articleId}/relations/collected?favlist_ids=`
    const collecteds = await this.get(`${url}[${this.readLaterId}]`)
    return collecteds[0].collected
  }

  async addReadLater(articleId, type) {
    const data = await this.post(`https://www.zhihu.com/api/v4/favlists/${this.readLaterId}/items`, {
      content_id: articleId,
      content_type: type,
    })
    if (data.content) {
      return data.content
    } else {
      throw Error('add read later error')
    }
  }

  async removeReadLater(articleId, type) {
    const data = await this.del(`https://www.zhihu.com/api/v4/favlists/${this.readLaterId}/items`, {
      content_id: articleId,
      content_type: type,
    })
    if (data.content) {
      return data.content
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
        background: '#8590a6',
      }).data('collected', true)
    } else {
      $btn.removeAttr('style')
        .data('collected', false)
    }
  }

  clickToggleCollect($btn, articleId, type) {
    $btn.on('click', async () => {
      if ($btn.data('collected')) {
        await this.removeReadLater(articleId, type)
        this.btnCollected($btn, false)
      } else {
        await this.addReadLater(articleId, type)
        this.btnCollected($btn)
      }
    })
  }

  async home($) {
    this.watch($('body'), '.Menu.PushNotifications-menu', false, ($menu) => {
      const $list = $menu.find('.PushNotifications-list')
      this.watch($list, '.PushNotifications-item', false, async ($item) => {
        const href = $item.find('> span:nth-child(3) a').attr('href')
        const type = href.toString().includes('zhuanlan') ? 'article' : 'answer'
        $item.append('<span class="read-later Button">Read later</span>')
        const articleId = this.matchArticleId(href)
        const $laterBtn = $item.find('.read-later')
        $laterBtn.css({
          padding: '5px',
          lineHeight: '14px',
          margin: '0 10px',
        })
        if (await this.inReadLater(articleId, type)) {
          this.btnCollected($laterBtn)
        }
        this.clickToggleCollect($laterBtn, articleId, type)
      })
    })
  }

  async zhuanlan($) {
    const articleId = this.matchArticleId(location)
    if (articleId) {
      const $laterBtn = $('.ColumnPageHeader-Button').prepend(`
        <button
          class="read-later Button FollowButton ColumnPageHeader-FollowButton Button--primary"
          type="button">Read later</button>
      `).find('.read-later')
      if (await this.inReadLater(articleId, 'article')) {
        this.btnCollected($laterBtn)
      }
      this.clickToggleCollect($laterBtn, articleId, 'article')
    }
  }
}

window[fnName] = (...args) => {
  const zhihu = new Zhihu(...args)
  zhihu.boot()
}

})()

// ==UserScript==
// @name         zhihu
// @namespace    https://github.com/weirongxu/my-userscripts
// @version      0.2.0
// @description  zhihu tools
// @author       Raidou
// @match        *://*.zhihu.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function() {
  'use strict'

  function setStyle($node, css) {
    Object.entries(css).forEach(([key, val]) => {
      $node.style[key] = val
    })
    return $node
  }


  class Zhihu {
    constructor() {
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

    watch($els, selector, once, callback) {
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

    async boot() {
      switch (location.host) {
        case 'www.zhihu.com':
          this.home()
          break
        case 'zhuanlan.zhihu.com':
          this.zhuanlan()
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
        setStyle($btn, {
          color: 'white',
          background: '#8590a6',
        }).setAttribute('collected', 'true')
      } else {
        $btn.removeAttribute('style')
        $btn.removeAttribute('collected')
      }
    }

    clickToggleCollect($btn, articleId, type) {
      $btn.addEventListener('click', async () => {
        if ($btn.hasAttribute('collected')) {
          await this.removeReadLater(articleId, type)
          this.btnCollected($btn, false)
        } else {
          await this.addReadLater(articleId, type)
          this.btnCollected($btn)
        }
      })
    }

    async home() {
      this.watch([document.body], '.Menu.PushNotifications-menu', false, ($menus) => {
        $menus.forEach($menu => {
          const $list = $menu.querySelectorAll('.PushNotifications-list')
          this.watch($list, '.PushNotifications-item', false, ($items) => {
            $items.forEach(async $item => {
              const href = $item.querySelector(':scope > span:nth-child(2) a').getAttribute('href')
              const type = href.toString().includes('zhuanlan') ? 'article' : 'answer'
              $item.insertAdjacentHTML('beforeend', '<span class="read-later Button">Read later</span>')
              const articleId = this.matchArticleId(href)
              const $laterBtn = $item.querySelector('.read-later')
              setStyle($laterBtn, {
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
        })
      })
    }

    async zhuanlan() {
      const articleId = this.matchArticleId(location)
      if (articleId) {
        const $buttons = document.querySelector('.ColumnPageHeader-Button')
        $buttons.insertAdjacentHTML('afterbegin', `
          <button
            class="read-later Button FollowButton ColumnPageHeader-FollowButton Button--primary"
            type="button">Read later</button>
        `)
        const $laterBtn = $buttons.querySelector('.read-later')
        if (await this.inReadLater(articleId, 'article')) {
          this.btnCollected($laterBtn)
        }
        this.clickToggleCollect($laterBtn, articleId, 'article')
      }
    }
  }

  const zhihu = new Zhihu()
  zhihu.boot()
})()

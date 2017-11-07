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

GM_xmlhttpRequest({
  method: 'GET',
  url: "https://code.jquery.com/jquery-2.2.4.min.js",
  onload(res) {
    console.log(res.response)
    const script = document.createElement("script")
    script.text = `${res.response};${fnName}(jQuery.noConflict(true));`
    document.body.appendChild(script)
  },
})

// var script = document.createElement('script')
// script.setAttribute("src", "//code.jquery.com/jquery-2.2.4.min.js")
// script.addEventListener('load', () => {
//   main(jQuery.noConflict(true))
// }, false)
// document.body.appendChild(script)

class Zhihu {
  constructor($) {
    this.$ = $

    this.config = JSON.parse($('#clientConfig').val())
    this.headers = {
      'Authorization': `Bearer ${this.config.tokens['Authorization'].join('|')}`,
      'X-UDID': this.config.tokens['X-UDID'],
      'X-XSRF-TOKEN': this.config.tokens['X-XSRF-TOKEN'],
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

  boot() {
    console.dir(location.host)
    switch (location.host) {
      case 'www.zhihu.com':
        this.home(this.$)
        break
      case 'zhuanlan.zhihu.com':
        this.zhuanlan(this.$)
        break
    }
  }

  async home($) {
    const $menu = $('.Menu.PushNotifications-menu')
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        console.log(mutation.type)
      })
    })
    console.dir($menu[0])
    observer.observe($menu[0], {
      attributes: true,
      childList: true,
      characterData: true,
    })
    $('.PushNotifications-list .PushNotifications-item').each(function() {
      $(this).append('<span class="UserLink">Read later</span>')
    })
  }

  async zhuanlan($) {
    const match = location.pathname.match(/.*\/(.*)/)
    if (match[1]) {
      const articleId = match[1]
      const readLayterId = 183046846
      const collecteds = await this.get(`https://www.zhihu.com/api/v4/articles/${articleId}/relations/collected?favlist_ids=[${readLayterId}]`)
      const collected = collecteds[0].collected
      let css = `
      padding: 18px;
      cursor: pointer;
      `
      const $laterBtn = $('.Navbar-functionality').prepend(
        `<a class="read-later" style="${css}">Read later</a>`).find('.read-later')
      const btnCollected = () => {
        $laterBtn.css({
          color: 'white',
          background: '#ccc',
        })
      }
      if (collected) {
        btnCollected()
      } else {
        $laterBtn.on('click', async () => {
          const data = await this.post(`https://www.zhihu.com/api/v4/favlists/${readLayterId}/items`, {
            content_id: articleId,
            content_type: "article",
          })
          if (data.content) {
            btnCollected()
          }
        })
      }
    }
  }
}

window[fnName] = ($) => {
  console.dir('test')
  const zhihu = new Zhihu($)
  zhihu.boot()
}

})()

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

    // console.dir($('#data'))
    // zhihu remove #data state dom when load page

    // console.dir(Cookies.get())
    // console.dir(document.cookie)
    this.config = JSON.parse($('#clientConfig').val())
    this.headers = {
      // z_c0
      'Authorization': `Bearer ${this.config.tokens['Authorization'].join('|')}`,
      // d_c0
      'X-UDID': this.config.tokens['X-UDID'],
      // _xsrf
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

window[fnName] = (...args) => {
  const zhihu = new Zhihu(...args)
  zhihu.boot()
}

})()

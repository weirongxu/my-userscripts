// ==UserScript==
// @name         zhihu tools
// @namespace    https://gist.github.com/weirongxu/c0d241ff3d94b2140570bf56124b382a
// @version      0.1
// @description  zhihu tools
// @author       Raidou
// @match        *://*.zhihu.com/*
// @grant        none
// ==/UserScript==

(function() {
'use strict'

var script = document.createElement("script")
script.setAttribute("src", "//code.jquery.com/jquery-2.2.4.min.js")
script.addEventListener('load', () => {
  main(jQuery.noConflict(true))
}, false)
document.body.appendChild(script)

async function main($) {
  const config = JSON.parse($('#clientConfig').val())
  const headers = {
    'Authorization': `Bearer ${config.tokens['Authorization'].join('|')}`,
    'X-UDID': config.tokens['X-UDID'],
    'X-XSRF-TOKEN': config.tokens['X-XSRF-TOKEN'],
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
  if (location.host === 'zhuanlan.zhihu.com') {
    const match = location.pathname.match(/.*\/(.*)/)
    if (match[1]) {
      const articleId = match[1]
      const readLayterId = 183046846
      const collecteds = await (await fetch(
        `https://www.zhihu.com/api/v4/articles/${articleId}/relations/collected?favlist_ids=[${readLayterId}]`,
        {
          headers,
        }
      )).json()
      const collected = collecteds[0].collected
      let css = `
      padding: 20px;
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
          const data = await (await fetch(`https://www.zhihu.com/api/v4/favlists/${readLayterId}/items`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              content_id: articleId,
              content_type: "article",
            })
          })).json()
          if (data.content) {
            btnCollected()
          }
        })
      }
    }
  }
}

})()

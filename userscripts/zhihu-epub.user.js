// ==UserScript==
// @name         zhihu epub
// @namespace    https://github.com/weirongxu/my-userscripts
// @version      0.0.1
// @description  zhihu epub
// @author       Raidou
// @match        *://*.zhihu.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/3.9.1/jszip.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js
// ==/UserScript==

// @ts-check

/**
 * @param {number} sm
 */
const sleep = async (sm) => new Promise((resolve) => setTimeout(resolve, sm));

(async function () {
  'use strict';

  const doc = document;

  doc.addEventListener('keydown', (e) => {
    if (e.key === 'Insert') {
      generateEpub().catch(console.error);
    }
  });

  async function generateEpub() {
    const userName = doc.querySelector('.ProfileHeader-name')?.textContent;
    if (!userName) throw new Error('can not get user name');
    const now = new Date();
    const gen = new EpubGen({
      date: now,
      lang: 'zh-CN',
      publisher: 'zhihu',
      title: userName,
      uuid: crypto.randomUUID(),
      sourceURL: window.location.href,
    });
    let items = Array.from(
      doc.querySelectorAll('#Profile-activities > div.css-0 > .List-item'),
    );
    items = items.filter(
      (item) =>
        !item.querySelector('.ContentItem-title .ActivityItem-StickyMark'),
    );
    if (!items.length) throw new Error('can not get article list');

    for (const [i, item] of items.entries()) {
      let rich = item.querySelector('.RichContent');
      if (!rich) {
        console.error(`item ${i} can not find rich`);
        continue;
      }
      if (rich.classList.contains('is-collapsed')) {
        const btn = rich.querySelector('button.ContentItem-more');
        if (btn && btn instanceof HTMLElement) btn.click();
        await sleep(1000);
      }
      item.scrollIntoView({
        inline: 'start',
      });
    }

    for (const [i, item] of items.entries()) {
      const titleEl = item.querySelector('.ContentItem-title');
      if (!titleEl) {
        console.error(`item ${i} can not find title`);
        continue;
      }
      const title =
        titleEl
          .querySelector('meta[itemprop="name"]')
          ?.getAttribute('content') ?? titleEl.textContent;
      if (!title) {
        console.error(`item ${i} can not get title`);
        continue;
      }
      let rich = item.querySelector('.RichContent');
      if (!rich) {
        console.error(`item ${i} can not find rich`);
        continue;
      }
      const content = `
        <h1>${title}</h1>
        ${rich.innerHTML}
      `;
      gen.genContentHTML(`${i.toString().padStart(3, '0')}`, title, content);
    }
    const blob = await gen.blob();
    /** @param {number} num */
    const pad2 = (num) => num.toString().padStart(2, '0');
    const datetimeStr = `${now.getFullYear()}-${pad2(
      now.getMonth() + 1,
    )}-${pad2(now.getDate())}-${pad2(now.getHours())}-${pad2(
      now.getMinutes(),
    )}-${pad2(now.getSeconds())}`;
    saveAs(blob, `知乎-${userName}-${datetimeStr}.epub`);
  }

  /**
   * @typedef Item
   * @type {{
       filename: string,
       title: string,
       properties?: string
     }}
   */

  class EpubGen {
    PARA_IGNORE_CLASS = '__para_ignore__';

    /**
     * @param {{
     *   uuid: string
     *   title: string
     *   lang: string
     *   date: Date
     *   publisher: string
     *   sourceURL?: string
     * }} options
     */
    constructor(options) {
      this.options = options;
      this.zip = new JSZip();
      /**
       * @type {Item[]}
       */
      this.items = [];
      this.genPre();
    }

    genContainer() {
      this.zip.file(
        'META-INF/container.xml',
        `
          <?xml version="1.0"?>
          <container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
            <rootfiles>
              <rootfile full-path="content.opf" media-type="application/oebps-package+xml"/>
            </rootfiles>
          </container>
        `.trim(),
      );
    }

    genContentOpf() {
      this.zip.file(
        'content.opf',
        `
          <package xmlns="http://www.idpf.org/2007/opf" unique-identifier="${
            this.options.uuid
          }" version="3.0" >
            <metadata
              xmlns:dc="http://purl.org/dc/elements/1.1/"
              xmlns:dcterms="http://purl.org/dc/terms/"
              xmlns:opf="http://www.idpf.org/2007/opf"
              xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
              <dc:title>${this.options.title}</dc:title>
              <dc:creator>unknown</dc:creator>
              <dc:language>${this.options.lang}</dc:language>
              <dc:date>${this.options.date.toISOString()}</dc:date>
              <dc:publisher>${this.options.publisher}</dc:publisher>
            </metadata>
            <manifest>
              <item href="page-styles.css" id="page-styles" media-type="text/css" />
              <item href="stylesheet.css" id="stylesheet" media-type="text/css" />
              ${this.items
                .map((item) => {
                  const filepath = this.genContentPath(item.filename);
                  return `<item href="${filepath}" id="${
                    item.filename
                  }" media-type="text/html" ${
                    item.properties ? `properties="${item.properties}" ` : ''
                  }} />`;
                })
                .join('\n')}
            </manifest>
            <spine>
              ${this.items
                .map(({ filename }) => `<itemref idref="${filename}" />`)
                .join('\n')}
            </spine>
          </package>
        `.trim(),
      );
    }

    /**
     * @param {string} filename
     */
    genContentPath(filename) {
      return `text/${filename}.html`;
    }

    genStyle() {
      this.zip.file(
        'page-styles.css',
        `
          @page {
            margin-bottom: 5pt;
            margin-top: 5pt
          }
        `,
      );
      this.zip.file(
        'stylesheet.css',
        `
          rt {
            user-select: none;
          }
          img {
            max-width: 100%;
          }
        `,
      );
    }

    genPre() {
      this.genContentHTML(
        'pre',
        '来源',
        `
          ${
            this.options.sourceURL
              ? `<p class="${this.PARA_IGNORE_CLASS}"><a target="_blank" href="${this.options.sourceURL}">
                ${this.options.sourceURL}
              </a></p>`
              : ''
          }
          <h1>${this.options.title}</h1>
        `,
      );
    }

    /**
     * @param {string} filename
     * @param {string} title
     * @param {string} content
     * @param {string=} properties
     */
    genContentHTML(filename, title, content, properties) {
      this.items.push({ filename, title, properties });
      this.zip.file(
        this.genContentPath(filename),
        `
          <!DOCTYPE html>
          <html lang="${this.options.lang}">
            <head>
              <title>${title}</title>
              <link href="../stylesheet.css" rel="stylesheet" type="text/css"/>
              <link href="../page-styles.css" rel="stylesheet" type="text/css"/>
              <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
            </head>
            <body>${content}</body>
          </html>
        `.trim(),
      );
    }

    genNav() {
      /**
       * @param {Item[]} items
       */
      const renderOl = (items) => {
        return `
          <ol>
            ${items
              .map(
                (item) =>
                  `<li>${`<a href="${this.genContentPath(item.filename)}">${
                    item.title
                  }</a>`}</li>`,
              )
              .join('\n')}
          </ol>
        `;
      };

      this.genContentHTML(
        'nav',
        '目录',
        `
          <nav epub:type="toc">
            ${renderOl(this.items)}
          </nav>
        `.trim(),
        'nav',
      );
    }

    gen() {
      this.zip.file('mimetype', 'application/epub+zip');
      this.genContainer();
      this.genStyle();
      this.genNav();
      this.genContentOpf();
    }

    async blob() {
      this.gen();
      return await this.zip.generateAsync({ type: 'blob' });
    }
  }
})();

javascript:(function () {
  "// to-mermaid bookmarklet";
  if ( window.to_mermaid_obs ) {
    window.to_mermaid_obs.disconnect();
    delete window.to_mermaid_obs;
  }
  const DB_MODE = true; "// replaced by build script";
  const version = "BM_VERSION_PLACEHOLDER";
  
  const TARGET_URL = DB_MODE
    ? "http://localhost:3000/to-mermaid/"
    : "https://sou3ilow.github.io/to-mermaid/";
  "// 抽出セレクタ";
  const SELECTOR_CODE  = 'code[class^="whitespace-pre! language-"] > span';
  const SELECTOR_TABLE = 'div[class*="_tableWrapper_"] > table';
  const SELECTOR   = SELECTOR_CODE + ", " + SELECTOR_TABLE;
  "// 言語名抽出 RegExp";
  const LANG_RE    = /language-([\w-]+)/;
  const TO         = TARGET_URL;
    
  const w = 600;
  const h = 600;
  const x = window.screen.availWidth - w - 20;
  const y = window.screenY + 20;
  
  const opts = DB_MODE
    ? ''
    : `width=${w},height=${h},left=${x},top=${y}`;
  
  const win = window.open(TARGET_URL, "toMermaid", opts);
  if (!win) { alert("to-mermaid: Popup blocked"); return; }
  
  "// 既送信ブロック管理（lang|code ハッシュ）";
  const SENT = new Set();

  "// テーブル要素をシンプルなHTMLに変換";
  function sanitizeTable(elem) {
    
    if (elem.nodeType === Node.TEXT_NODE) {
      return document.createTextNode(elem.textContent);
    }

    if (elem.nodeType !== Node.ELEMENT_NODE) {
      return null;
    }

    let tag = elem.tagName.toLowerCase();
    if (tag === 'b') tag = 'strong';
    if (tag === 'i') tag = 'em';

    const keep = new Set(['table','thead','tbody','tr','th','td','strong','em','code','a']);
    if (!keep.has(tag)) {
      return [...elem.childNodes]
      .map(sanitizeTable)
      .flat()
      .filter(Boolean);
    }

    const newElem = document.createElement(tag);
    if (tag === 'a' && elem.hasAttribute('href')) {
      newElem.setAttribute('href', elem.getAttribute('href'));
    }
    [...elem.childNodes].forEach(child => { 
      const sc = sanitizeTable(child);
       if (sc) { 
        (sc instanceof Node ? [sc] : sc).forEach(c => {
          newElem.appendChild(c);
        });
      }
    });
    return newElem;
  }
   
  "// SELECTOR に合致するコード片を収集";
  function collect () {
    const results = [];
    document.querySelectorAll(SELECTOR).forEach(el => {
      if ( el.matches(SELECTOR_CODE ) ) { 

        const parentClass = el.parentElement.className;
        const match       = parentClass.match(LANG_RE);
        const lang        = match ? match[1] : "unknown";
        const code        = el.innerText;
        const key         = lang + "|" + code;
        "// 未送信なら結果に含める";
        if (!SENT.has(key)) {
          SENT.add(key);
          results.push({ lang, code });
        }
      } else if ( el.matches(SELECTOR_TABLE) ) {
        try {
          const lang = "html-table";
          const code = sanitizeTable(el).outerHTML;
          const key  = lang + "|" + code;
          "// 未送信なら結果に含める";
          if (!SENT.has(key)) {
            SENT.add(key);
            results.push({ lang, code });
          }
        } catch (e) {
          console.error("to-mermaid: error in sanitizing table", e);
        }
      }
    });
    return results;
  }
    
  "// 新規ブロックのみ送信";
  function sendBlocks() {
    const blocks = collect();
    if (!blocks.length) return;
    sendMessage({ type: "codeBlocks", blocks }, [blocks.length, "new blocks", blocks]);
  }

  function sendMessage(message, logMessage=[]) {
    console.log("to-mermaid ▶︎ 送信", ...logMessage);
    win.postMessage(message, TO);
  }

  let lastTitle = "ChatGPT";
  function checkAndSendTitle() {
    "// title check";
    const newTitle = document.title;
    if ( newTitle !== "ChatGPT" && newTitle != lastTitle ) {
      sendMessage({type: "pageMoved", title: newTitle}, ["title changed", lastTitle, newTitle]);
      lastTitle = newTitle;
    } else {
      console.log(newTitle);
    }
  }
  
  "// 初回：1 秒待って送信";
  setTimeout(()=>{
     sendMessage({ type: "bmVersion", version }, ["bookmarklet version", version]);
     checkAndSendTitle();
     sendBlocks();
   }, 1000);
  
  "// DOM 変化を監視し、SELECTOR 出現で send()";
    window.to_mermaid_obs = new MutationObserver(muts => {
    
    checkAndSendTitle();
    
    "// check new code blocks";
    for (const m of muts) for (const n of m.addedNodes) {
      if (n.nodeType !== 1) continue;
      if (n.matches?.(SELECTOR) || n.querySelector?.(SELECTOR)) { sendBlocks(); return; }
    } 
  });
  console.log("to-mermaid: waiting new code block..");
  window.to_mermaid_obs.observe(document.body, { childList: true, subtree: true });

})();

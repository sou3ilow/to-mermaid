javascript:(function () {
  "// to-mermaid bookmarklet";
  if ( window.to_mermaid_bm ) {
    console.log("to-mermaid bm is already running. reload page if something went wrong.");
    return;
  }
  window.to_mermaid_bm = true;
  
  const version = "BM_VERSION_PLACEHOLDER";
  
  const TARGET_URL = "https://sou3ilow.github.io/to-mermaid/";
  const SELECTOR   = 'code[class^="whitespace-pre! language-"] > span';  "// 抽出セレクタ";
  const LANG_RE    = /language-([\w-]+)/;                             "// 言語名抽出 RegExp";
  const TO         = TARGET_URL;  
    
  const w = 800;
  const h = 600;
  const x = window.screenX + 100;
  const y = window.screenY + 100;
  
  const opts = `width=${w},height=${h},left=${x},top=${y}`;
  
  const win = window.open(TARGET_URL, "toMermaid", opts);
  if (!win) { alert("to-mermaid: Popup blocked"); return; }
  
  const SENT = new Set();   "// 既送信ブロック管理（lang|code ハッシュ）";
  
  "// SELECTOR に合致するコード片を収集";
  function collect () {
    const results = [];
    document.querySelectorAll(SELECTOR).forEach(el => {
      const parentClass = el.parentElement.className;
      const match       = parentClass.match(LANG_RE);
      const lang        = match ? match[1] : "unknown";
      const code        = el.innerText;
      const key         = lang + "|" + code;
  
      if (!SENT.has(key)) {                 "// 未送信なら結果に含める";
        SENT.add(key);
        results.push({ lang, code });
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
  const obs = new MutationObserver(muts => {
    
    checkAndSendTitle();
    
    "// check new code blocks";
    for (const m of muts) for (const n of m.addedNodes) {
      if (n.nodeType !== 1) continue;
      if (n.matches?.(SELECTOR) || n.querySelector?.(SELECTOR)) { sendBlocks(); return; }
    } 
  });
  console.log("to-mermaid: waiting new code block..");
  obs.observe(document.body, { childList: true, subtree: true });

})();

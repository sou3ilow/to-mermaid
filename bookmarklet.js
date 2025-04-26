javascript:(function () {
"// to-mermaid bookmarklet v0.5 ── 新ブロックのみ送信版";

const TARGET_URL = "https://sou3ilow.github.io/to-mermaid/";
const SELECTOR   = 'code[class^="whitespace-pre! language-"] span';  "// 抽出セレクタ";
const LANG_RE    = /language-([\w-]+)/;                             "// 言語名抽出 RegExp";

const win = window.open(TARGET_URL, "toMermaid");
if (!win) { alert("Popup blocked"); return; }

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
function send () {
  const blocks = collect();
  if (!blocks.length) return;             "// 送るものが無ければ何もしない";
  console.log("to-mermaid ▶︎ 送信", blocks.length, "new blocks", blocks);
  win.postMessage({ type: "codeBlocks", blocks }, "*");
}

"// 初回：1 秒待って送信";
setTimeout(send, 1000);

"// DOM 変化を監視し、SELECTOR 出現で send()";
const obs = new MutationObserver(muts => {
  for (const m of muts) for (const n of m.addedNodes) {
    if (n.nodeType !== 1) continue;
    if (n.matches?.(SELECTOR) || n.querySelector?.(SELECTOR)) { send(); return; }
  }
});
obs.observe(document.body, { childList: true, subtree: true });
})();

// bookmarklet.js — 可読性優先の元コード
export function getBookmarklet () {
  // ❶ ブックマークレット本体（コメントは "// …"; 形式）
  const core = `
    (function () {
    "// to-mermaid bookmarklet v0.3";

    const TARGET_URL = "https://sou3ilow.github.io/to-mermaid/";
    const win = window.open(TARGET_URL, "toMermaid");
    if (!win) { alert("Popup blocked"); return; }

    "// すべての <pre class=\\"language-*\\"> を取得";
    function collect () {
      return [...document.querySelectorAll('pre[class^="language-"]')]
        .map(el => {
          const cls = [...el.classList].find(c => c.startsWith("language-")) || "";
          return { lang: cls.replace("language-", ""), code: el.textContent };
        });
    }

    "// 送信ロジック";
    function send () {
      const blocks = collect();
      console.log("to-mermaid ▶︎ 送信", blocks.length, "blocks", blocks);
      win.postMessage({ type: "codeBlocks", blocks }, TARGET_URL);
    }
    send();

    "// DOM 監視して追加ブロック検知";
    const obs = new MutationObserver(muts => {
      for (const m of muts) {
        for (const n of m.addedNodes) {
          if (n.nodeType !== 1) continue;
          if (n.matches?.('pre[class^="language-"]') ||
              n.querySelector?.('pre[class^="language-"]')) {
            send(); return;
          }
        }
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
    })();`;

  // ❷ 最小限の空白削除（改行→空白、先頭末尾 trim）
  const minified = core
    .replace(/\n\s+/g, " ")     // 改行＋インデント→空白
    .replace(/\s{2,}/g, " ")    // 連続空白→1個
    .trim();

  // ❸ javascript: スキームを付与し return
  return "javascript:" + minified;
}

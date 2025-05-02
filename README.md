# to-mermaid

## What's this
- ChatGPTで生成された mermaid, dot, vega-lite ブロックを別ウインドウでビジュアライズするブックマークレットです。
- 表示用に https://sou3ilow.github.io/to-mermaid を使います。

## Privacy/Security
-  https://sou3ilow.github.io/to-mermaid/index.html を使いますが、データはそちらに送信されず、ローカルで受け渡しされます。
-  送信されたデータは 利用しているViewerのJSに渡します。これらのJSはCDNにあるものを参照していますが、そちらの中身の検証は行っていません。

### 仕組み

- bookmarklet(client)を起動するとhttps://sou3ilow.github.io/to-mermaid/ (viewer)を別windowでひらく。
- clientはページ内のcode blockをpostMessageを使って、viewerページに送信（サーバには送らない。）
- clientはイベントを監視して、追加のブロックがあるとviewerに追加送信
- viewerは届いたcodeを順次図示。

### idea

- [*]bookmarklet側にバージョンを入れたい。初回に送ってチェックしたい。
- [*]ページが切り替わったときに、ページタイトルを送りたい。送ってviewer側で表示したい。
- エラーが有るMermaidグラフをその場で修正できるようにしたい。
- [*] markmap
- plantuml, ditaa, table
- page毎に整理
- pageで目次


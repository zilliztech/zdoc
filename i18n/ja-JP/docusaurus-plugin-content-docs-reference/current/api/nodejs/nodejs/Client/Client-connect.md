---
title: "connect() | Node.js"
slug: /node/node/Client-connect
sidebar_label: "connect()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "このメソッドは、必要に応じて指定された SDK バージョンを使用して Zilliz Cloud クラスターに接続します。 | Node.js"
type: docx
token: SkLsdMpB7oiZLMx8T04cCd9Knqf
sidebar_position: 4
keywords: 
  - 質問応答システム
  - llm-as-a-judge
  - ハイブリッドベクトル検索
  - 動画重複排除
  - zilliz
  - zilliz cloud
  - cloud
  - connect()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# connect()

このメソッドは、必要に応じて指定された SDK バージョンを使用して Zilliz Cloud クラスターに接続します。

```javascript
connect(sdkVersion): void
```

## リクエスト構文\{#request-syntax}

```javascript
connect({
    sdkVersion: string
})
```

**パラメーター:**

- **sdkVersion** (*string*) -

    **[必須]**

    Node.js SDK のバージョン。

**戻り値** *void*

このメソッドは何も返しません。

## 例\{#example}

```java
connect(2.3.5)
```


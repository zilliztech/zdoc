---
title: "checkCompatibility() | Node.js"
slug: /node/node/Client-checkCompatibility
sidebar_label: "checkCompatibility()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、SDK と Milvus サーバーの互換性を確認します。 | Node.js"
type: docx
token: Tq1Md4GuIoNbfuxK03ncIa7onMc
sidebar_position: 1
keywords: 
  - 異常検知
  - sentence transformers
  - レコメンダーシステム
  - 情報検索
  - zilliz
  - zilliz cloud
  - cloud
  - checkCompatibility()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# checkCompatibility()

この操作は、SDK と Milvus サーバーの互換性を確認します。

```javascript
await milvusClient.checkCompatibility(data?)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.checkCompatibility({
    checker?: Function,
    message?: string
})
```

**パラメーター:**

- **checker** (*Function*) -

    現在の SDK に互換性がある場合に呼び出されるコールバック関数です。

- **message** (*string*) -  

    SDK に互換性がない場合にスローするエラーメッセージです。

**戻り値の型:**

*Promise*\<*any*>

**戻り値:**

指定された checker 関数の結果に解決される promise です。

## 例\{#examples}

```javascript
await milvusClient.checkCompatibility({
   checker: () => { console.log("compatible") },
   message: "incompatible"
});
```

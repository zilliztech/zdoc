---
title: "closeConnection() | Node.js"
slug: /node/node/Client-closeConnection
sidebar_label: "closeConnection()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、Milvus server への現在の接続を閉じます。 | Node.js"
type: docx
token: HtOGdjTpOoG0RcxpGv1cCBcEnAh
sidebar_position: 3
keywords: 
  - ニューラルネットワーク
  - ディープラーニング
  - ナレッジベース
  - 自然言語処理
  - zilliz
  - zilliz cloud
  - クラウド
  - closeConnection()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# closeConnection()

この操作は、Milvus server への現在の接続を閉じます。

```javascript
await milvusClient.closeConnection()
```

## Request Syntax\{#request-syntax}

```javascript
milvusClient.closeConnection()
```

**RETURNS:**

*Promise&lt;CONNECT_STATUS&gt;*

Milvus server への現在の接続の最終ステータスに解決される promise を返します。これは `SHUTDOWN` である必要があります。


**例外:**

- **Error**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## Example\{#example}

```javascript
milvusClient.closeConnection()
```

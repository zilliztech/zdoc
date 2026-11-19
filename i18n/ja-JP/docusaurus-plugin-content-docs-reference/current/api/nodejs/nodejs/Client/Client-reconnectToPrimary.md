---
title: "reconnectToPrimary() | Node.js"
slug: /node/node/Client-reconnectToPrimary
sidebar_label: "reconnectToPrimary()"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "この操作は、プライマリエンドポイントが変更されたときにチャネルプールを再構築し、クライアントをグローバルクラスタートポロジーのプライマリクラスターに再接続します。 | Node.js"
type: origin
token: shared-Client-reconnectToPrimary
displayed_sidebar: nodeSidebar

---

# reconnectToPrimary()

この操作は、プライマリエンドポイントが変更されたときにチャネルプールを再構築し、クライアントをグローバルクラスタートポロジーのプライマリクラスターに再接続します。

```javascript
await milvusClient.reconnectToPrimary()
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.reconnectToPrimary()
```

**パラメーター:**

この操作にはパラメーターはありません。

**戻り値:**

*Promise&lt;boolean&gt;*

このメソッドは、クライアントがプライマリクラスターへの再接続に成功したかどうかを示す **boolean** に解決される promise を返します。

**例外:**

- **Error**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## 例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const reconnected = await milvusClient.reconnectToPrimary();
```

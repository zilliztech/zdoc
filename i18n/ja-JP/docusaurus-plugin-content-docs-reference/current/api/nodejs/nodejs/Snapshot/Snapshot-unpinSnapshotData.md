---
title: "unpinSnapshotData() | Node.js"
slug: /node/node/Snapshot-unpinSnapshotData
sidebar_label: "unpinSnapshotData()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はスナップショットデータのピン留めを解除し、不要になったときにガベージコレクションの対象にできるようにします。 | Node.js"
type: docx
token: IjXedJe6poxhmAx6hFpcpNyJnsb
sidebar_position: 9
keywords: 
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model
  - zilliz
  - zilliz cloud
  - cloud
  - unpinSnapshotData()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# unpinSnapshotData()

この操作はスナップショットデータのピン留めを解除し、不要になったときにガベージコレクションの対象にできるようにします。

```typescript
await milvusClient.unpinSnapshotData(data: UnpinSnapshotDataReq)
```

## リクエスト構文\{#request-syntax}

```typescript
await milvusClient.unpinSnapshotData({
    pin_id: number | string,
    timeout?: number,
    client_request_id?: string,
})
```

**パラメータ:**

- **pin_id** (*number | string*) -<br/>
  **[必須]**<br/>
  pinSnapshotData() によって返される pin ID。

- **timeout** (*number*) -<br/>
  RPC に許可するオプションの時間（ミリ秒）。`undefined` に設定すると、クライアントはサーバーが応答するかエラーが発生するまで待機し続けます。デフォルトは `undefined` です。

- **client_request_id** (*string*) -<br/>
  リクエスト追跡のためのトレース ID。オプションです。

**戻り値:**

*Promise&lt;ResStatus&gt;*

**例外:**

- **MilvusError**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await client.unpinSnapshotData({
    pin_id: 'pin_12345',
});
```

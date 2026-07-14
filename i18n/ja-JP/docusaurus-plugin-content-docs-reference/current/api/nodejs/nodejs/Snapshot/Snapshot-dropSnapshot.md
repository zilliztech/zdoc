---
title: "dropSnapshot() | Node.js"
slug: /node/node/Snapshot-dropSnapshot
sidebar_label: "dropSnapshot()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、collection の snapshot を削除します。 | Node.js"
type: docx
token: DgiOdVOuLoKWFPxzKyucGV8Tnfb
sidebar_position: 3
keywords: 
  - milvus ベクトルデータベース
  - milvus db
  - milvus ベクトル db
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - cloud
  - dropSnapshot()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# dropSnapshot()

この操作は、collection の snapshot を削除します。

```typescript
await milvusClient.dropSnapshot(data: DropSnapshotReq)
```

## リクエスト構文\{#request-syntax}

```typescript
await milvusClient.dropSnapshot({
    collection_name: string,
    snapshot_name: string,
    db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**パラメータ:**

- **collection_name** (*string*) -
**[REQUIRED]**
snapshot が属する collection の名前です。

- **snapshot_name** (*string*) -
**[REQUIRED]**
削除する snapshot の名前です。

- **db_name** (*string*) -
データベース名です。省略可能です。

- **timeout** (*number*) -
RPC に許可する任意の時間（ミリ秒）です。`undefined` に設定されている場合、クライアントはサーバーが応答するかエラーが発生するまで待機し続けます。デフォルトは `undefined` です。

- **client_request_id** (*string*) -
リクエスト追跡用のトレース ID です。省略可能です。

**戻り値:**

*Promise&lt;ResStatus&gt;*

**例外:**

- **MilvusError**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## 例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await client.dropSnapshot({
    collection_name: 'my_collection',
    snapshot_name: 'snapshot_2024_01',
});
```

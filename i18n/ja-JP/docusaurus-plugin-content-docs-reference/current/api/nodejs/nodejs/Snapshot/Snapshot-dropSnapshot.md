---
title: "dropSnapshot() | Node.js"
slug: /node/node/Snapshot-dropSnapshot
sidebar_label: "dropSnapshot()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation deletes a snapshot for a コレクション. | Node.js"
type: docx
token: DgiOdVOuLoKWFPxzKyucGV8Tnfb
sidebar_position: 3
keywords: 
  - milvus ベクトル データベース
  - milvus db
  - milvus ベクトル db
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - cloud
  - dropSnapshot()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# dropSnapshot()

This operation deletes a snapshot for a コレクション.

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

**パラメーター:**

- **collection_name** (*string*) -<br/>
  **[REQUIRED]**<br/>
  The name of the コレクション the snapshot belongs to.

- **snapshot_name** (*string*) -<br/>
  **[必須]**<br/>
  削除するスナップショットの名前。

- **db_name** (*string*) -<br/>
  データベースの名前。任意です。

- **timeout** (*number*) -<br/>
  An optional duration of time in milliseconds to allow for the RPC. If it is set to undefined, the client keeps waiting until the server responds or an error occurs. Default is undefined.

- **client_request_id** (*string*) -<br/>
  リクエスト追跡用のトレース ID。任意です。

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

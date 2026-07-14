---
title: "pinSnapshotData() | Node.js"
slug: /node/node/Snapshot-pinSnapshotData
sidebar_label: "pinSnapshotData()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、スナップショットデータがガベージコレクションされないように pin します。スナップショットをリストア用に利用可能な状態で維持するために使用します。 | Node.js"
type: docx
token: Bx6FdwVlUoqZjVxZwSFcnUr2nDe
sidebar_position: 7
keywords: 
  - Agentic RAG
  - rag llm architecture
  - private llms
  - nn search
  - zilliz
  - zilliz cloud
  - cloud
  - pinSnapshotData()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# pinSnapshotData()

この操作は、スナップショットデータがガベージコレクションされないように pin します。スナップショットをリストア用に利用可能な状態で維持するために使用します。

```typescript
await milvusClient.pinSnapshotData(data: PinSnapshotDataReq)
```

## リクエスト構文\{#request-syntax}

```typescript
await milvusClient.pinSnapshotData({
    collection_name: string,
    snapshot_name: string,
    ttl_seconds?: number | string,
    db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**パラメーター:**

- **collection_name** (*string*) -
**[必須]**
スナップショットが属する collection の名前。

- **snapshot_name** (*string*) -
**[必須]**
pin するスナップショットの名前。

- **ttl_seconds** (*number | string*) -
オプションの pin TTL（秒）。指定しない場合、スナップショットは無期限に pin されます。

- **db_name** (*string*) -
データベース名。オプション。

- **timeout** (*number*) -
RPC に許可する時間（ミリ秒）のオプション値です。`undefined` に設定すると、サーバーが応答するかエラーが発生するまでクライアントは待機し続けます。デフォルトは `undefined` です。

- **client_request_id** (*string*) -
リクエスト追跡用のトレース ID。オプション。

**戻り値** *Promise&lt;PinSnapshotDataResponse&gt;*

このメソッドは、**PinSnapshotDataResponse** オブジェクトに解決される promise を返します。

```typescript
{
    pin_id: string,
    status:  ResStatus
}
```

**パラメーター:**

- **pin_id** (*string*) -
pin リースの識別子です。TTL の期限が切れる前に pin を解除するには、この値を `unpinSnapshotData()` に渡します。

- **ResStatus**
**ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコード。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示します。この操作が成功した場合は空文字列のままです。

## 例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await client.pinSnapshotData({
    collection_name: 'my_collection',
    snapshot_name: 'snapshot_2024_01',
});
```

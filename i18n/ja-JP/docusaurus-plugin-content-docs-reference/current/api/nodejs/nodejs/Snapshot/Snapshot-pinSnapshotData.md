---
title: "pinSnapshotData() | Node.js"
slug: /node/node/Snapshot-pinSnapshotData
sidebar_label: "pinSnapshotData()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、スナップショットデータがガベージコレクションされないように pin します。これを使用して、スナップショットが復元可能な状態を維持できるようにします。 | Node.js"
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

この操作は、スナップショットデータがガベージコレクションされないように pin します。これを使用して、スナップショットが復元可能な状態を維持できるようにします。

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

**パラメータ:**

- **collection_name** (*string*) -<br/>
  **[必須]**<br/>
  スナップショットが属する collection の名前です。

- **snapshot_name** (*string*) -<br/>
  **[必須]**<br/>
  pin するスナップショットの名前です。

- **ttl_seconds** (*number | string*) -<br/>
  オプションの pin TTL（秒単位）です。指定しない場合、スナップショットは無期限に pin されます。

- **db_name** (*string*) -<br/>
  データベース名です。オプションです。

- **timeout** (*number*) -<br/>
  RPC に許容するオプションの時間（ミリ秒単位）です。`undefined` に設定されている場合、クライアントはサーバーが応答するかエラーが発生するまで待機し続けます。デフォルトは `undefined` です。

- **client_request_id** (*string*) -<br/>
  リクエスト追跡用のトレース ID です。オプションです。

**戻り値** *Promise&lt;PinSnapshotDataResponse&gt;*

このメソッドは、**PinSnapshotDataResponse** オブジェクトに解決される promise を返します。

```typescript
{
    pin_id: string,
    status:  ResStatus
}
```

**パラメータ:**

- **pin_id** (*string*) -<br/>
  pin リースの識別子です。TTL が期限切れになる前に pin を解除するには、この値を `unpinSnapshotData()` に渡します。

- **ResStatus**<br/>
  **ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由です。この操作が成功した場合は空文字列のままです。

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

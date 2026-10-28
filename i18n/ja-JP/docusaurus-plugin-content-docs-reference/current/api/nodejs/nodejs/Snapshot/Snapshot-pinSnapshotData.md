---
title: "pinSnapshotData() | Node.js"
slug: /node/node/Snapshot-pinSnapshotData
sidebar_label: "pinSnapshotData()"
beta: ON REQUEST
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、スナップショットデータがガベージコレクションされないように固定します。これを使用して、スナップショットを復元できる状態に維持します。 | Node.js"
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

---

import Admonition from '@theme/Admonition';


# pinSnapshotData()

この操作は、スナップショットデータを固定してガベージコレクションの対象にならないようにします。スナップショットを復元可能な状態に維持するために使用します。

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
  スナップショットが属するコレクションの名前です。

- **snapshot_name** (*string*) -<br/>
  **[必須]**<br/>
  固定するスナップショットの名前です。

- **ttl_seconds** (*number | string*) -<br/>
  固定 TTL を秒単位で指定します。省略可能です。指定しない場合、スナップショットは無期限に固定されます。

- **db_name** (*string*) -<br/>
  データベースの名前です。省略可能です。

- **timeout** (*number*) -<br/>
  RPC に許容される時間をミリ秒単位で指定します。省略可能です。undefined に設定すると、サーバーが応答するかエラーが発生するまでクライアントは待機します。デフォルトは undefined です。

- **client_request_id** (*string*) -<br/>
  リクエスト追跡用のトレース ID です。省略可能です。

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
  ピンリースの識別子です。TTL が期限切れになる前にピンを解除するには、この値を `unpinSnapshotData()` に渡します。

- **ResStatus**<br/>
  **ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

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

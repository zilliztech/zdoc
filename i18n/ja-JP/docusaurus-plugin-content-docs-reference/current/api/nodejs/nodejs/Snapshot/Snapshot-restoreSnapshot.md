---
title: "restoreSnapshot() | Node.js"
slug: /node/node/Snapshot-restoreSnapshot
sidebar_label: "restoreSnapshot()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、スナップショットからコレクションを新規または既存のコレクションに復元します。 | Node.js"
type: docx
token: PpuUdB9bLoL1UUxfIH4cxXkXnSb
sidebar_position: 8
keywords: 
  - 自然言語処理
  - AI チャットボット
  - コサイン距離
  - ベクトルデータベースとは
  - zilliz
  - zilliz cloud
  - cloud
  - restoreSnapshot()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# restoreSnapshot()

この操作は、スナップショットからコレクションを新規または既存のコレクションに復元します。

```typescript
await milvusClient.restoreSnapshot(data: RestoreSnapshotReq)
```

## Request Syntax\{#request-syntax}

```typescript
await milvusClient.restoreSnapshot({
    snapshot_name: string,
    source_collection_name: string,
    target_collection_name: string,
    source_db_name?: string,
    target_db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**PARAMETERS:**

- **snapshot_name** (*string*) -<br/>
  **[REQUIRED]**<br/>
  復元元のスナップショットの名前。

- **source_collection_name** (*string*) -<br/>
  **[REQUIRED]**<br/>
  ソースコレクションの名前。

- **target_collection_name** (*string*) -<br/>
  **[REQUIRED]**<br/>
  復元先のターゲットコレクションの名前。

- **source_db_name** (*string*) -<br/>
  ソースデータベース名。省略可能です。

- **target_db_name** (*string*) -<br/>
  ターゲットデータベース名。省略可能です。

- **timeout** (*number*) -<br/>
  RPC に許可する任意の時間（ミリ秒）。`undefined` に設定されている場合、クライアントはサーバーが応答するかエラーが発生するまで待機し続けます。デフォルトは `undefined` です。

- **client_request_id** (*string*) -<br/>
  リクエスト追跡用のトレース ID。省略可能です。

**RETURNS** *Promise&lt;RestoreSnapshotResponse&gt;*

このメソッドは **RestoreSnapshotResponse** オブジェクトに解決される promise を返します。

```typescript
{
    job_id: string,
    status:  ResStatus
}
```

**PARAMETERS:**

- **job_id** (*string*) -<br/>
  非同期復元ジョブの識別子。この値を `getRestoreSnapshotState()` に渡して、完了までポーリングします。

- **ResStatus**<br/>
  **ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコード。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。

## Example\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await client.restoreSnapshot({
    snapshot_name: 'snapshot_2024_01',
    source_collection_name: 'my_collection',
    target_collection_name: 'restored_collection',
});
```

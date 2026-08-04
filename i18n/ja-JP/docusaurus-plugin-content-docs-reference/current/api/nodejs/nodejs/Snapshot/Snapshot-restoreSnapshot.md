---
title: "restoreSnapshot() | Node.js"
slug: /node/node/Snapshot-restoreSnapshot
sidebar_label: "restoreSnapshot()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、snapshot から新規または既存の collection に collection を復元します。 | Node.js"
type: docx
token: PpuUdB9bLoL1UUxfIH4cxXkXnSb
sidebar_position: 8
keywords: 
  - 自然言語処理
  - AIチャットボット
  - コサイン距離
  - ベクトルデータベースとは
  - zilliz
  - zilliz cloud
  - クラウド
  - restoreSnapshot()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# restoreSnapshot()

この操作は、snapshot から新規または既存の collection に collection を復元します。

```typescript
await milvusClient.restoreSnapshot(data: RestoreSnapshotReq)
```

## リクエスト構文\{#request-syntax}

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

**パラメータ:**

- **snapshot_name** (*string*) -<br/>
  **[必須]**<br/>
  復元元の snapshot の名前。

- **source_collection_name** (*string*) -<br/>
  **[必須]**<br/>
  ソース collection の名前。

- **target_collection_name** (*string*) -<br/>
  **[必須]**<br/>
  復元先のターゲット collection の名前。

- **source_db_name** (*string*) -<br/>
  ソース database 名。任意です。

- **target_db_name** (*string*) -<br/>
  ターゲット database 名。任意です。

- **timeout** (*number*) -<br/>
  RPC に許容する時間（ミリ秒）の任意の期間です。`undefined` に設定されている場合、クライアントはサーバーが応答するかエラーが発生するまで待機し続けます。デフォルトは `undefined` です。

- **client_request_id** (*string*) -<br/>
  リクエスト追跡用のトレース ID。任意です。

**戻り値** *Promise&lt;RestoreSnapshotResponse&gt;*

このメソッドは、**RestoreSnapshotResponse** オブジェクトに解決される promise を返します。

```typescript
{
    job_id: string,
    status:  ResStatus
}
```

**パラメータ:**

- **job_id** (*string*) -<br/>
  非同期復元ジョブの識別子です。完了をポーリングするには、この値を `getRestoreSnapshotState()` に渡します。

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

const res = await client.restoreSnapshot({
    snapshot_name: 'snapshot_2024_01',
    source_collection_name: 'my_collection',
    target_collection_name: 'restored_collection',
});
```

---
title: "listRestoreSnapshotJobs() | Node.js"
slug: /node/node/Snapshot-listRestoreSnapshotJobs
sidebar_label: "listRestoreSnapshotJobs()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、すべてのスナップショット復元ジョブを一覧表示します。対象コレクション名とデータベース名でフィルタリングできます。 | Node.js"
type: docx
token: TIXDdW1BmoPA3FxX0ONczHFqnKf
sidebar_position: 5
keywords: 
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - listRestoreSnapshotJobs()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listRestoreSnapshotJobs()

この操作は、すべてのスナップショット復元ジョブを一覧表示します。対象コレクション名とデータベース名でフィルタリングできます。

```typescript
await milvusClient.listRestoreSnapshotJobs(data?: ListRestoreSnapshotJobsReq)
```

## Request Syntax\{#request-syntax}

```typescript
await milvusClient.listRestoreSnapshotJobs({
    collection_name?: string,
    db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**PARAMETERS:**

- **collection_name** (*string*) -
対象コレクション名でのオプションのフィルターです。

- **db_name** (*string*) -
データベース名でのオプションのフィルターです。

- **timeout** (*number*) -
RPC に許可するオプションの時間の長さ（ミリ秒）です。`undefined` に設定すると、サーバーが応答するかエラーが発生するまで、クライアントは待機し続けます。デフォルトは `undefined` です。

- **client_request_id** (*string*) -
リクエスト追跡用のトレース ID です。オプションです。

**RETURNS** *Promise&lt;ListRestoreSnapshotJobsResponse&gt;*

このメソッドは、**ListRestoreSnapshotJobsResponse** オブジェクトに解決される promise を返します。

```typescript
{
    jobs: RestoreSnapshotJobInfo[],
    status:  ResStatus
}
```

**PARAMETERS:**

- **jobs** (*RestoreSnapshotJobInfo[]*) -
要求されたデータベースおよびコレクションフィルターに一致する復元ジョブのリストです。**RestoreSnapshotJobInfo** の完全なフィールドリファレンスについては、`getRestoreSnapshotState()` のドキュメントを参照してください。

- **ResStatus**
**ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合、**0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合、**Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由です。この操作が成功した場合、空文字列のままです。

## Example\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await client.listRestoreSnapshotJobs({
    collection_name: 'restored_collection',
});
```

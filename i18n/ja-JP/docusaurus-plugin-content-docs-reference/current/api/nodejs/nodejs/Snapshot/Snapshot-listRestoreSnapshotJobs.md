---
title: "listRestoreSnapshotJobs() | Node.js"
slug: /node/node/Snapshot-listRestoreSnapshotJobs
sidebar_label: "listRestoreSnapshotJobs()"
beta: ON REQUEST
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、すべてのスナップショットリストアジョブを一覧表示します。対象のコレクション名とデータベース名でフィルターできます。 | Node.js"
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

---

import Admonition from '@theme/Admonition';


# listRestoreSnapshotJobs()

この操作は、すべてのスナップショットリストアジョブを一覧表示します。対象のコレクション名とデータベース名でフィルターできます。

```typescript
await milvusClient.listRestoreSnapshotJobs(data?: ListRestoreSnapshotJobsReq)
```

## リクエスト構文\{#request-syntax}

```typescript
await milvusClient.listRestoreSnapshotJobs({
    collection_name?: string,
    db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**パラメーター:**

- **collection_name** (*string*) -<br/>
  対象のコレクション名によるオプションのフィルターです。

- **db_name** (*string*) -<br/>
  データベース名によるオプションのフィルターです。

- **timeout** (*number*) -<br/>
  RPC に許可する時間をミリ秒単位で指定するオプションです。undefined に設定した場合、サーバーが応答するかエラーが発生するまで、クライアントは待機し続けます。デフォルトは undefined です。

- **client_request_id** (*string*) -<br/>
  リクエスト追跡用のトレース ID です。オプションです。

**戻り値** *Promise&lt;ListRestoreSnapshotJobsResponse&gt;*

このメソッドは、**ListRestoreSnapshotJobsResponse** オブジェクトに解決される promise を返します。

```typescript
{
    jobs: RestoreSnapshotJobInfo[],
    status:  ResStatus
}
```

**パラメーター:**

- **jobs** (*RestoreSnapshotJobInfo[]*) -<br/>
  要求されたデータベースとコレクションのフィルターに一致するリストアジョブのリストです。**RestoreSnapshotJobInfo** のフィールドの完全なリファレンスについては、`getRestoreSnapshotState()` のドキュメントを参照してください。

- **ResStatus**<br/>
  **ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由です。この操作が成功した場合は空の文字列のままです。

## 例\{#example}

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

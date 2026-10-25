---
title: "listRestoreSnapshotJobs() | Node.js"
slug: /node/node/Snapshot-listRestoreSnapshotJobs
sidebar_label: "listRestoreSnapshotJobs()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation lists all snapshot restore jobs. You can filter by target コレクション name and データベース name. | Node.js"
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

This operation lists all snapshot restore jobs. You can filter by target コレクション name and データベース name.

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

- **collection_name** (*string*) -<br/>
  Optional filter by target コレクション name.

- **db_name** (*string*) -<br/>
  データベース名でのオプションのフィルタです。

- **timeout** (*number*) -<br/>
  RPC に許可するオプションの時間長（ミリ秒）です。undefined に設定されている場合、サーバーが応答するかエラーが発生するまで、クライアントは待機し続けます。デフォルトは undefined です。

- **client_request_id** (*string*) -<br/>
  リクエスト追跡のためのトレース ID です。オプションです。

**RETURNS** *Promise&lt;ListRestoreSnapshotJobsResponse&gt;*

このメソッドは、**ListRestoreSnapshotJobsResponse** オブジェクトに解決される promise を返します。

```typescript
{
    jobs: RestoreSnapshotJobInfo[],
    status:  ResStatus
}
```

**PARAMETERS:**

- **jobs** (*RestoreSnapshotJobInfo[]*) -<br/>
  A list of restore jobs that match the requested データベース and コレクション filters. For the full **RestoreSnapshotJobInfo** field reference, refer to the `getRestoreSnapshotState()` doc.

- **ResStatus**<br/>
  **ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由です。この操作が成功した場合は空文字列のままです。

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

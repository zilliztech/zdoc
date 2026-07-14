---
title: "listRefreshExternalCollectionJobs() | Node.js"
slug: /node/node/Collections-listRefreshExternalCollectionJobs
sidebar_label: "listRefreshExternalCollectionJobs()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、external collection のすべての refresh ジョブを一覧表示します。collection 名とデータベース名でフィルタリングできます。 | Node.js"
type: docx
token: AG5zdQCpXoy11MxWgD0ciYBRnJb
sidebar_position: 30
keywords: 
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - zilliz
  - zilliz cloud
  - cloud
  - listRefreshExternalCollectionJobs()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listRefreshExternalCollectionJobs()

この操作は、external collection のすべての refresh ジョブを一覧表示します。collection 名とデータベース名でフィルタリングできます。

```typescript
await milvusClient.listRefreshExternalCollectionJobs(data?: ListRefreshExternalCollectionJobsReq)
```

## リクエスト構文\{#request-syntax}

```typescript
await milvusClient.listRefreshExternalCollectionJobs({
    collection_name?: string,
    db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**PARAMETERS:**

- **collection_name** (*string*) -
collection 名でフィルタリングするためのオプション項目です。

- **db_name** (*string*) -
データベース名でフィルタリングするためのオプション項目です。

- **timeout** (*number*) -
RPC に許可する時間の長さ（ミリ秒）のオプション値です。`undefined` に設定されている場合、サーバーが応答するかエラーが発生するまでクライアントは待機し続けます。デフォルトは `undefined` です。

- **client_request_id** (*string*) -
リクエスト追跡用のトレース ID です。オプションです。

**RETURNS** *Promise&lt;ListRefreshExternalCollectionJobsResponse&gt;*

このメソッドは、**ListRefreshExternalCollectionJobsResponse** オブジェクトに解決される promise を返します。

```typescript
{
    jobs: RefreshExternalCollectionJobInfo[],
    status:  ResStatus
}
```

**PARAMETERS:**

- **jobs** (*RefreshExternalCollectionJobInfo[]*) -
要求された database および collection フィルターに一致する refresh ジョブの一覧です。**RefreshExternalCollectionJobInfo** の完全なフィールド参照については、`getRefreshExternalCollectionProgress()` のドキュメントを参照してください。

- **ResStatus**
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

const res = await client.listRefreshExternalCollectionJobs({
    collection_name: 'my_external_collection',
});
```

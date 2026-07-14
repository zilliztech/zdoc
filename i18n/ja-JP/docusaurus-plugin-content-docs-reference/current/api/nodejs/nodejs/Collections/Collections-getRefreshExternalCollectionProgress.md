---
title: "getRefreshExternalCollectionProgress() | Node.js"
slug: /node/node/Collections-getRefreshExternalCollectionProgress
sidebar_label: "getRefreshExternalCollectionProgress()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、external collection のリフレッシュジョブの進行状況を確認します。refreshExternalCollection() によって返される jobid を使用します。 | Node.js"
type: docx
token: E7pZd2Yfzolgiyxcvz8cSFfKnoc
sidebar_position: 29
keywords: 
  - 異常検知
  - sentence transformers
  - レコメンダーシステム
  - 情報検索
  - zilliz
  - zilliz cloud
  - クラウド
  - getRefreshExternalCollectionProgress()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# getRefreshExternalCollectionProgress()

この操作は、external collection のリフレッシュジョブの進行状況を確認します。refreshExternalCollection() によって返される `job_id` を使用します。

```typescript
await milvusClient.getRefreshExternalCollectionProgress(data: GetRefreshExternalCollectionProgressReq)
```

## Request Syntax\{#request-syntax}

```typescript
await milvusClient.getRefreshExternalCollectionProgress({
    job_id: number | string,
    timeout?: number,
    client_request_id?: string,
})
```

**PARAMETERS:**

- **job_id** (*number | string*) -
**[REQUIRED]**
refreshExternalCollection() によって返されるジョブ ID。

- **timeout** (*number*) -
RPC に許可するオプションの時間（ミリ秒）。`undefined` に設定されている場合、クライアントはサーバーが応答するかエラーが発生するまで待機し続けます。デフォルトは `undefined` です。

- **client_request_id** (*string*) -
リクエスト追跡用のトレース ID。オプションです。

**RETURNS** *Promise&lt;GetRefreshExternalCollectionProgressResponse&gt;*

このメソッドは、**GetRefreshExternalCollectionProgressResponse** オブジェクトに解決される promise を返します。

```typescript
{
    job_info: RefreshExternalCollectionJobInfo,
    status:  ResStatus
}
```

**PARAMETERS:**

- **job_info** (*RefreshExternalCollectionJobInfo*) -
リフレッシュジョブの現在の状態。

    - **job_id** (*string*) -

        ジョブ識別子。

    - **collection_name** (*string*) -

        リフレッシュ中の external collection。

    - **state** (*RefreshExternalCollectionState*) -

        現在のジョブ状態。指定可能な値は **RefreshPending**、**RefreshInProgress**、**RefreshCompleted**、**RefreshFailed** です。

    - **progress** (*string*) -

        **"0"** から **"100"** までの整数として表される完了率。

    - **reason** (*string*) -

        **state** が **RefreshFailed** の場合の失敗理由。それ以外の場合は空文字列です。

    - **external_source** (*string*) -

        ジョブによって記録された外部ソースパス。

    - **start_time** (*string*) -

        ジョブが開始された時刻。

    - **end_time** (*string*) -

        ジョブが終了した時刻。ジョブがまだ実行中の場合は空文字列です。

- **ResStatus**
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

const progress = await client.getRefreshExternalCollectionProgress({
    job_id: 'job_12345',
});
```

---
title: "getRefreshExternalCollectionProgress() | Node.js"
slug: /node/node/Collections-getRefreshExternalCollectionProgress
sidebar_label: "getRefreshExternalCollectionProgress()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、外部コレクションのリフレッシュジョブの進行状況を確認します。refreshExternalCollection() によって返された jobid を使用します。 | Node.js"
type: docx
token: E7pZd2Yfzolgiyxcvz8cSFfKnoc
sidebar_position: 33
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

---

import Admonition from '@theme/Admonition';


# getRefreshExternalCollectionProgress()

この操作は、外部コレクションのリフレッシュジョブの進行状況を確認します。refreshExternalCollection() によって返された job_id を使用します。

```typescript
await milvusClient.getRefreshExternalCollectionProgress(data: GetRefreshExternalCollectionProgressReq)
```

## リクエスト構文\{#request-syntax}

```typescript
await milvusClient.getRefreshExternalCollectionProgress({
    job_id: number | string,
    timeout?: number,
    client_request_id?: string,
})
```

**パラメーター:**

- **job_id** (*number | string*) -<br/>
  **[必須]**<br/>
  refreshExternalCollection() によって返されるジョブ ID です。

- **timeout** (*number*) -<br/>
  RPC に許可するミリ秒単位の任意の時間です。undefined に設定した場合、クライアントはサーバーが応答するかエラーが発生するまで待機し続けます。デフォルトは undefined です。

- **client_request_id** (*string*) -<br/>
  リクエストを追跡するためのトレース ID です。任意です。

**戻り値** *Promise&lt;GetRefreshExternalCollectionProgressResponse&gt;*

このメソッドは、**GetRefreshExternalCollectionProgressResponse** オブジェクトに解決される Promise を返します。

```typescript
{
    job_info: RefreshExternalCollectionJobInfo,
    status:  ResStatus
}
```

**パラメーター:**

- **job_info** (*RefreshExternalCollectionJobInfo*) -<br/>
  リフレッシュジョブの現在の状態です。

    - **job_id** (*string*) -

        ジョブ識別子です。

    - **collection_name** (*string*) -

        リフレッシュ対象の外部コレクションです。

    - **state** (*RefreshExternalCollectionState*) -

        現在のジョブ状態です。指定可能な値は **RefreshPending**、**RefreshInProgress**、**RefreshCompleted**、**RefreshFailed** です。

    - **progress** (*string*) -

        **"0"** から **"100"** までの整数で表される完了率です。

    - **reason** (*string*) -

        **state** が **RefreshFailed** の場合の失敗理由です。それ以外の場合は空の文字列です。

    - **external_source** (*string*) -

        ジョブによって記録された外部ソースパスです。

    - **start_time** (*string*) -

        ジョブが開始された時刻です。

    - **end_time** (*string*) -

        ジョブが終了した時刻です。ジョブがまだ実行中の場合は空の文字列です。

- **ResStatus**<br/>
  **ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作の結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示します。この操作が成功した場合は空の文字列のままです。

## 例\{#example}

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

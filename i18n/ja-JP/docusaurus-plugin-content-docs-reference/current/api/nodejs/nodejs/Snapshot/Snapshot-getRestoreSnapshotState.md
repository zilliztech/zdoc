---
title: "getRestoreSnapshotState() | Node.js"
slug: /node/node/Snapshot-getRestoreSnapshotState
sidebar_label: "getRestoreSnapshotState()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作はスナップショット復元ジョブの状態を確認します。restoreSnapshot() によって返される jobid を使用します。 | Node.js"
type: docx
token: IHY0di5uzooBe8xOCJqci9vinNh
sidebar_position: 4
keywords: 
  - コンテキストウィンドウ
  - 自然言語検索
  - 類似検索
  - マルチモーダル RAG
  - zilliz
  - zilliz cloud
  - クラウド
  - getRestoreSnapshotState()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# getRestoreSnapshotState()

この操作はスナップショット復元ジョブの状態を確認します。restoreSnapshot() によって返される job_id を使用します。

```typescript
await milvusClient.getRestoreSnapshotState(data: GetRestoreSnapshotStateReq)
```

## リクエスト構文\{#request-syntax}

```typescript
await milvusClient.getRestoreSnapshotState({
    job_id: number | string,
    timeout?: number,
    client_request_id?: string,
})
```

**パラメータ:**

- **job_id** (*number | string*) -<br/>
  **[必須]**<br/>
  restoreSnapshot() によって返される復元ジョブ ID。

- **timeout** (*number*) -<br/>
  RPC に許可するオプションの時間（ミリ秒単位）。`undefined` に設定すると、サーバーが応答するかエラーが発生するまでクライアントは待機し続けます。デフォルトは `undefined` です。

- **client_request_id** (*string*) -<br/>
  リクエスト追跡のためのトレース ID。オプションです。

**戻り値** *Promise&lt;GetRestoreSnapshotStateResponse&gt;*

このメソッドは、**GetRestoreSnapshotStateResponse** オブジェクトに解決される Promise を返します。

```typescript
{
    info: RestoreSnapshotJobInfo,
    status:  ResStatus
}
```

**パラメータ:**

- **info** (*RestoreSnapshotJobInfo*) -<br/>
  復元ジョブの現在の状態。

    - **job_id** (*string*) -

        ジョブ識別子。

    - **snapshot_name** (*string*) -

        復元対象のスナップショット。

    - **db_name** (*string*) -

        ターゲット database。

    - **collection_name** (*string*) -

        ターゲット collection 名。

    - **state** (*RestoreSnapshotState*) -

        現在のジョブ状態。取り得る値は **RestoreSnapshotNone**、**RestoreSnapshotPending**、**RestoreSnapshotExecuting**、**RestoreSnapshotCompleted**、**RestoreSnapshotFailed** です。

    - **progress** (*number*) -

        **0** から **100** までの整数で表される完了率。

    - **reason** (*string*) -

        **state** が **RestoreSnapshotFailed** の場合の失敗理由。それ以外の場合は空文字列です。

    - **start_time** (*string*) -

        ジョブが開始された時刻。

    - **time_cost** (*string*) -

        ジョブ開始からの総経過時間。

- **ResStatus**<br/>
  **ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコード。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。

## 例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await client.getRestoreSnapshotState({
    job_id: 'job_12345',
});
```

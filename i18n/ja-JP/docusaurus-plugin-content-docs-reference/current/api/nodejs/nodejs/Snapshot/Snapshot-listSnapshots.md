---
title: "listSnapshots() | Node.js"
slug: /node/node/Snapshot-listSnapshots
sidebar_label: "listSnapshots()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、コレクションのすべてのスナップショットを一覧表示します。 | Node.js"
type: docx
token: VjhTds7NPoyPjBxk4PNc5pe0nw6
sidebar_position: 6
keywords: 
  - AI Hallucination
  - AI Agent
  - semantic search
  - Anomaly Detection
  - zilliz
  - zilliz cloud
  - cloud
  - listSnapshots()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listSnapshots()

この操作は、コレクションのすべてのスナップショットを一覧表示します。

```typescript
await milvusClient.listSnapshots(data: ListSnapshotsReq)
```

## リクエスト構文\{#request-syntax}

```typescript
await milvusClient.listSnapshots({
    collection_name: string,
    db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**パラメータ:**

- **collection_name** (*string*) -<br/>
  **[必須]**<br/>
  コレクションの名前。

- **db_name** (*string*) -<br/>
  データベースの名前。省略可能です。

- **timeout** (*number*) -<br/>
  RPC に許可するオプションの時間（ミリ秒）です。`undefined` に設定されている場合、クライアントはサーバーが応答するかエラーが発生するまで待機し続けます。デフォルトは `undefined` です。

- **client_request_id** (*string*) -<br/>
  リクエスト追跡用のトレース ID。省略可能です。

**戻り値** *Promise&lt;ListSnapshotsResponse&gt;*

このメソッドは、**ListSnapshotsResponse** オブジェクトに解決される promise を返します。

```typescript
{
    snapshots: string[],
    status:  ResStatus
}
```

**パラメータ:**

- **snapshots** (*string[]*) -<br/>
  要求されたコレクションに現在存在するスナップショット名の一覧。

- **ResStatus**<br/>
  **ResStatus** オブジェクト。

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

const res = await client.listSnapshots({
    collection_name: 'my_collection',
});
```

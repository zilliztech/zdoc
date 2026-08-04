---
title: "createSnapshot() | Node.js"
slug: /node/node/Snapshot-createSnapshot
sidebar_label: "createSnapshot()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は collection のスナップショットを作成します。スナップショットは collection とそのデータの現在の状態を記録します。 | Node.js"
type: docx
token: NeUFdr0OXo90RExodnccqc3OnYU
sidebar_position: 1
keywords: 
  - セマンティック検索
  - 異常検知
  - sentence transformers
  - レコメンダーシステム
  - zilliz
  - zilliz cloud
  - クラウド
  - createSnapshot()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# createSnapshot()

この操作は collection のスナップショットを作成します。スナップショットは collection とそのデータの現在の状態を記録します。

```typescript
await milvusClient.createSnapshot(data: CreateSnapshotReq)
```

## リクエスト構文\{#request-syntax}

```typescript
await milvusClient.createSnapshot({
    collection_name: string,
    snapshot_name: string,
    description?: string,
    compaction_protection_seconds?: number | string,
    db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**パラメーター:**

- **collection_name** (*string*) -<br/>
  **[必須]**<br/>
  スナップショットを作成する collection の名前。

- **snapshot_name** (*string*) -<br/>
  **[必須]**<br/>
  スナップショットの名前。

- **description** (*string*) -<br/>
  任意のスナップショット説明。

- **compaction_protection_seconds** (*number | string*) -<br/>
  参照されるセグメントを compaction から保護する期間。任意。

- **db_name** (*string*) -<br/>
  データベースの名前。任意。

- **timeout** (*number*) -<br/>
  RPC に許可する任意の時間（ミリ秒単位）。`undefined` に設定されている場合、サーバーが応答するかエラーが発生するまで、クライアントは待機し続けます。デフォルトは `undefined` です。

- **client_request_id** (*string*) -<br/>
  リクエスト追跡用のトレース ID。任意。

**戻り値:**

*Promise&lt;ResStatus&gt;*

**例外:**

- **MilvusError**

    この操作中に何らかのエラーが発生した場合、この例外が発生します。

## 例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await client.createSnapshot({
    collection_name: 'my_collection',
    snapshot_name: 'snapshot_2024_01',
    description: 'Monthly backup',
});
```

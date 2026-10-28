---
title: "createSnapshot() | Node.js"
slug: /node/node/Snapshot-createSnapshot
sidebar_label: "createSnapshot()"
beta: ON REQUEST
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、コレクションのスナップショットを作成します。スナップショットは、コレクションとそのデータの現在の状態をキャプチャします。 | Node.js"
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

---

import Admonition from '@theme/Admonition';


# createSnapshot()

この操作は、コレクションのスナップショットを作成します。スナップショットは、コレクションとそのデータの現在の状態をキャプチャします。

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
  スナップショットを作成するコレクションの名前です。

- **snapshot_name** (*string*) -<br/>
  **[必須]**<br/>
  スナップショットの名前です。

- **description** (*string*) -<br/>
  スナップショットの説明です。任意です。

- **compaction_protection_seconds** (*number | string*) -<br/>
  参照されるセグメントを Compaction から保護する期間です。任意です。

- **db_name** (*string*) -<br/>
  データベースの名前です。任意です。

- **timeout** (*number*) -<br/>
  RPC に許容する時間をミリ秒単位で指定します。任意です。undefined に設定した場合、クライアントはサーバーが応答するかエラーが発生するまで待機し続けます。デフォルトは undefined です。

- **client_request_id** (*string*) -<br/>
  リクエストを追跡するためのトレース ID です。任意です。

**戻り値:**

*Promise&lt;ResStatus&gt;*

**例外:**

- **MilvusError**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

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

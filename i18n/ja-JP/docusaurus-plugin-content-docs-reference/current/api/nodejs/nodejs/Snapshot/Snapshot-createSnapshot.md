---
title: "createSnapshot() | Node.js"
slug: /node/node/Snapshot-createSnapshot
sidebar_label: "createSnapshot()"
beta: false
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

# createSnapshot()

この操作は、コレクションのスナップショットを作成します。スナップショットは、コレクションとそのデータの現在の状態をキャプチャします。

```javascript
await milvusClient.createSnapshot(data: CreateSnapshotReq)
```

## リクエスト構文\{#request-syntax}

```javascript
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

- **collection_name** (*string*) -
**[必須]**
スナップショットを作成するコレクションの名前です。

- **snapshot_name** (*string*) -
**[必須]**
スナップショットの名前です。

- **description** (*string*) -
スナップショットの説明です。任意です。

- **compaction_protection_seconds** (*number | string*) -
参照されるセグメントを Compaction から保護する期間です。任意です。

- **db_name** (*string*) -
データベースの名前です。任意です。

- **timeout** (*number*) -
RPC に割り当てる時間をミリ秒単位で指定します。任意です。undefined に設定した場合、クライアントはサーバーが応答するかエラーが発生するまで待機し続けます。デフォルトは undefined です。

- **client_request_id** (*string*) -
リクエスト追跡用のトレース ID です。任意です。

**戻り値:**

*Promise&lt;ResStatus&gt;*

このメソッドは、**ResStatus** オブジェクトに解決される promise を返します。

**例外:**

- **Error**

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

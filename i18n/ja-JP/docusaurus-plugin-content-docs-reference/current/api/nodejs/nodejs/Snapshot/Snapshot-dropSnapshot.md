---
title: "dropSnapshot() | Node.js"
slug: /node/node/Snapshot-dropSnapshot
sidebar_label: "dropSnapshot()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、コレクションのスナップショットを削除します。 | Node.js"
type: docx
token: DgiOdVOuLoKWFPxzKyucGV8Tnfb
sidebar_position: 3
keywords: 
  - milvus ベクトル データベース
  - milvus db
  - milvus ベクトル db
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - cloud
  - dropSnapshot()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# dropSnapshot()

この操作は、コレクションのスナップショットを削除します。

```javascript
await milvusClient.dropSnapshot(data: DropSnapshotReq)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.dropSnapshot({
    collection_name: string,
    snapshot_name: string,
    db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**パラメーター:**

<NextChannel action="exclude">

- **collection_name** (*string*) -
**[必須]**
スナップショットが属するコレクションの名前です。

- **snapshot_name** (*string*) -
**[必須]**
削除するスナップショットの名前です。

- **db_name** (*string*) -
データベースの名前です。オプションです。

- **timeout** (*number*) -
RPC に許可する時間をミリ秒単位で指定するオプションです。undefined に設定した場合、クライアントはサーバーが応答するかエラーが発生するまで待機し続けます。デフォルトは undefined です。

- **client_request_id** (*string*) -
リクエスト追跡用のトレース ID です。オプションです。

</NextChannel>

<NextChannel action="include">

- **collection_name** (*string*) -
**[必須]**
スナップショットが属するコレクションの名前です。

- **snapshot_name** (*string*) -
**[必須]**
削除するスナップショットの名前です。

- **db_name** (*string*) -
データベースの名前です。オプションです。

- **timeout** (*number*) -
RPC に許可する時間をミリ秒単位で指定するオプションです。undefined に設定した場合、クライアントはサーバーが応答するかエラーが発生するまで待機し続けます。デフォルトは undefined です。

- **client_request_id** (*string*) -
呼び出し元が指定するオプションの ID で、リクエストの追跡とログまたはトレースとの関連付けに使用されます。SDK はこれを `client-request-id` gRPC メタデータヘッダーとして送信し、この ID を自動生成することはありません。リクエストごとに、UUID などの一意の値を使用してください。OpenTelemetry の trace-ID 形式（32 文字の小文字 16 進数）の値も、クライアントテレメトリでトレース ID として使用されます。

</NextChannel>

**戻り値:**

*Promise&lt;ResStatus&gt;*

このメソッドは、**ResStatus** オブジェクトに解決される promise を返します。

**例外:**

- **Error**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## 例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await client.dropSnapshot({
    collection_name: 'my_collection',
    snapshot_name: 'snapshot_2024_01',
});
```

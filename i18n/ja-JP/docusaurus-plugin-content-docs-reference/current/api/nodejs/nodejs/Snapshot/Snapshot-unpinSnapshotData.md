---
title: "unpinSnapshotData() | Node.js"
slug: /node/node/Snapshot-unpinSnapshotData
sidebar_label: "unpinSnapshotData()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はスナップショットデータのピン留めを解除し、不要になったときにガベージコレクションの対象にできるようにします。 | Node.js"
type: docx
token: IjXedJe6poxhmAx6hFpcpNyJnsb
sidebar_position: 9
keywords: 
  - vectordb
  - マルチモーダル ベクトル データベース検索
  - 検索拡張生成
  - 大規模言語モデル
  - zilliz
  - zilliz cloud
  - クラウド
  - unpinSnapshotData()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# unpinSnapshotData()

この操作はスナップショットデータのピン留めを解除し、不要になったときにガベージコレクションの対象にできるようにします。

```javascript
await milvusClient.unpinSnapshotData(data: UnpinSnapshotDataReq)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.unpinSnapshotData({
    pin_id: number | string,
    timeout?: number,
    client_request_id?: string,
})
```

**パラメーター:**

- **pin_id** (*number | string*) -
**[必須]**
pinSnapshotData() によって返されるピン ID です。

- **timeout** (*number*) -
RPC の実行を許可する時間をミリ秒単位で指定するオプションです。undefined に設定した場合、クライアントはサーバーが応答するかエラーが発生するまで待機し続けます。デフォルトは undefined です。

- **client_request_id** (*string*) -
リクエスト追跡用のトレース ID です。任意です。

**戻り値:**

*Promise&lt;ResStatus&gt;*

このメソッドは、**ResStatus** オブジェクトに解決される promise を返します。

**例外:**

- **エラー**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await client.unpinSnapshotData({
    pin_id: 'pin_12345',
});
```

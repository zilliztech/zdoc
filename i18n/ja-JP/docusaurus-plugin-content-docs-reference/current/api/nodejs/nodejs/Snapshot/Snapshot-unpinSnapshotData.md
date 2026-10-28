---
title: "unpinSnapshotData() | Node.js"
slug: /node/node/Snapshot-unpinSnapshotData
sidebar_label: "unpinSnapshotData()"
beta: ON REQUEST
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

import Admonition from '@theme/Admonition';


# unpinSnapshotData()

この操作はスナップショットデータのピン留めを解除し、不要になったときにガベージコレクションの対象にできるようにします。

```typescript
await milvusClient.unpinSnapshotData(data: UnpinSnapshotDataReq)
```

## リクエスト構文\{#request-syntax}

```typescript
await milvusClient.unpinSnapshotData({
    pin_id: number | string,
    timeout?: number,
    client_request_id?: string,
})
```

**パラメーター:**

- **pin_id** (*number | string*) -<br/>
  **[必須]**<br/>
  pinSnapshotData() によって返されるピン ID です。

- **timeout** (*number*) -<br/>
  RPC に許容される時間をミリ秒単位で指定します。省略可能です。undefined に設定すると、サーバーが応答するかエラーが発生するまでクライアントは待機します。デフォルトは undefined です。

- **client_request_id** (*string*) -<br/>
  リクエスト追跡用のトレース ID です。省略可能です。

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

const res = await client.unpinSnapshotData({
    pin_id: 'pin_12345',
});
```

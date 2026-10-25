---
title: "flushAll() | Node.js"
slug: /node/node/Management-flushAll
sidebar_label: "flushAll()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation flushes all コレクション, sealing all segments and persisting data on disk. | Node.js"
type: docx
token: Zyi9dGUnQodt7MxIq17cyN54nOd
sidebar_position: 22
keywords: 
  - Pinecone ベクトル データベース
  - Audio search
  - semantic search とは
  - Embedding model
  - zilliz
  - zilliz cloud
  - cloud
  - flushAll()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# flushAll()

This operation flushes all コレクション, sealing all segments and persisting data on disk.

```typescript
await milvusClient.flushAll(data?: FlushAllReq)
```

## リクエスト構文\{#request-syntax}

```typescript
await milvusClient.flushAll({
    db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**パラメータ:**

- **db_name** (*string*) -<br/>
  データベース名。省略可能です。

- **timeout** (*number*) -<br/>
  RPC に許可するオプションの時間（ミリ秒）です。undefined に設定されている場合、サーバーが応答するかエラーが発生するまでクライアントは待機し続けます。デフォルトは undefined です。

- **client_request_id** (*string*) -<br/>
  リクエスト追跡のためのトレース ID。省略可能です。

**戻り値** *Promise&lt;FlushAllResponse&gt;*

このメソッドは **FlushAllResponse** オブジェクトに解決される promise を返します。

```typescript
{
    flush_all_ts: number,
    flush_all_tss: Record<string, number>,
    flush_all_msgs: Record<string, any>,
    cluster_info: FlushClusterInfo,
    status:  ResStatus
}
```

**パラメータ:**

- **flush_all_ts** (*number*) -<br/>
  A single hybrid timestamp identifying the flush. Deprecated; prefer **flush_all_tss** for multi-クラスター deployments.

- **flush_all_tss** (*Record&lt;string, number&gt;*) -<br/>
  A mapping from クラスター ID to the hybrid timestamp at which the flush completed in that クラスター.

- **flush_all_msgs** (*Record&lt;string, any&gt;*) -<br/>
  physical channel 名から、ストレージレイヤーで使用される flush メタデータへのマッピングです。

- **cluster_info** (*FlushClusterInfo*) -<br/>
  The クラスター topology that participated in the flush.

    - **cluster_id** (*string*) -

        The クラスター identifier.

    - **cchannel** (*string*) -

        control channel 名です。

    - **pchannels** (*string[]*) -

        flush の対象となる physical channel です。

- **ResStatus**<br/>
  **ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由です。この操作が成功した場合は空文字列のままです。

## 例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await client.flushAll();
```

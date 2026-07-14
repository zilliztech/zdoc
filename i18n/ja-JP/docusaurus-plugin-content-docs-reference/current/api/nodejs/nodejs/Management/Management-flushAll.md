---
title: "flushAll() | Node.js"
slug: /node/node/Management-flushAll
sidebar_label: "flushAll()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作はすべての collections を flush し、すべての segments を seal して、データをディスクに永続化します。 | Node.js"
type: docx
token: Zyi9dGUnQodt7MxIq17cyN54nOd
sidebar_position: 22
keywords: 
  - Pinecone vector database
  - Audio search
  - semantic search とは
  - Embedding model
  - zilliz
  - zilliz cloud
  - cloud
  - flushAll()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# flushAll()

この操作はすべての collections を flush し、すべての segments を seal して、データをディスクに永続化します。

```typescript
await milvusClient.flushAll(data?: FlushAllReq)
```

## Request Syntax\{#request-syntax}

```typescript
await milvusClient.flushAll({
    db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**PARAMETERS:**

- **db_name** (*string*) -
データベースの名前です。任意です。

- **timeout** (*number*) -
RPC に許可する任意の時間の長さ（ミリ秒）です。`undefined` に設定すると、サーバーが応答するかエラーが発生するまでクライアントは待機し続けます。デフォルトは `undefined` です。

- **client_request_id** (*string*) -
リクエスト追跡用のトレース ID です。任意です。

**RETURNS** *Promise&lt;FlushAllResponse&gt;*

このメソッドは、**FlushAllResponse** オブジェクトに解決される promise を返します。

```typescript
{
    flush_all_ts: number,
    flush_all_tss: Record<string, number>,
    flush_all_msgs: Record<string, any>,
    cluster_info: FlushClusterInfo,
    status:  ResStatus
}
```

**PARAMETERS:**

- **flush_all_ts** (*number*) -
flush を識別する単一のハイブリッドタイムスタンプです。非推奨です。マルチクラスターのデプロイでは **flush_all_tss** の使用を推奨します。

- **flush_all_tss** (*Record&lt;string, number&gt;*) -
cluster ID から、その cluster で flush が完了した時点のハイブリッドタイムスタンプへのマッピングです。

- **flush_all_msgs** (*Record&lt;string, any&gt;*) -
物理チャネル名から、ストレージ層で使用される flush メタデータへのマッピングです。

- **cluster_info** (*FlushClusterInfo*) -
flush に参加した cluster トポロジーです。

    - **cluster_id** (*string*) -

        cluster 識別子です。

    - **cchannel** (*string*) -

        制御チャネル名です。

    - **pchannels** (*string[]*) -

        flush の対象となる物理チャネルです。

- **ResStatus**
**ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由です。この操作が成功した場合は空文字列のままです。

## Example\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await client.flushAll();
```

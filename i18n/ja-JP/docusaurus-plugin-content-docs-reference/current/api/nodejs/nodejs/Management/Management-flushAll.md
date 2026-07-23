---
title: "flushAll() | Node.js"
slug: /node/node/Management-flushAll
sidebar_label: "flushAll()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、すべての collection を flush し、すべての segment を seal して、データをディスクに永続化します。 | Node.js"
type: docx
token: Zyi9dGUnQodt7MxIq17cyN54nOd
sidebar_position: 22
keywords: 
  - Pinecone vector database
  - Audio search
  - what is semantic search
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

この操作は、すべての collection を flush し、すべての segment を seal して、データをディスクに永続化します。

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
  データベースの名前です。省略可能です。

- **timeout** (*number*) -<br/>
  RPC に許可する時間の長さをミリ秒単位で指定する省略可能な値です。`undefined` に設定した場合、クライアントはサーバーが応答するかエラーが発生するまで待機し続けます。デフォルトは `undefined` です。

- **client_request_id** (*string*) -<br/>
  リクエスト追跡のためのトレース ID です。省略可能です。

**戻り値** *Promise&lt;FlushAllResponse&gt;*

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

**パラメータ:**

- **flush_all_ts** (*number*) -<br/>
  flush を識別する単一の hybrid timestamp です。非推奨です。マルチ cluster デプロイメントでは **flush_all_tss** を優先してください。

- **flush_all_tss** (*Record&lt;string, number&gt;*) -<br/>
  cluster ID から、その cluster で flush が完了した時点の hybrid timestamp へのマッピングです。

- **flush_all_msgs** (*Record&lt;string, any&gt;*) -<br/>
  physical channel 名から、ストレージレイヤーで使用される flush メタデータへのマッピングです。

- **cluster_info** (*FlushClusterInfo*) -<br/>
  flush に参加した cluster トポロジーです。

    - **cluster_id** (*string*) -

        cluster 識別子です。

    - **cchannel** (*string*) -

        制御チャネル名です。

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

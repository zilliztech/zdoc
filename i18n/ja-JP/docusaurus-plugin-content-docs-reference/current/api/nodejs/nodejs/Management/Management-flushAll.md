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

# flushAll()

This operation flushes all コレクション, sealing all segments and persisting data on disk.

```javascript
await milvusClient.flushAll(data?: FlushAllReq)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.flushAll({
    db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**パラメータ:**

<NextChannel action="exclude">

- **db_name** (*string*) -
データベースの名前です。任意です。

- **timeout** (*number*) -
RPC の実行を許可する時間をミリ秒単位で指定します。任意です。undefined に設定すると、サーバーが応答するかエラーが発生するまでクライアントは待機し続けます。デフォルトは undefined です。

- **client_request_id** (*string*) -
リクエストを追跡するためのトレース ID です。任意です。

</NextChannel>

<NextChannel action="include">

- **db_name** (*string*) -
データベースの名前です。任意です。

- **timeout** (*number*) -
RPC の実行を許可する時間をミリ秒単位で指定します。任意です。undefined に設定すると、サーバーが応答するかエラーが発生するまでクライアントは待機し続けます。デフォルトは undefined です。

- **client_request_id** (*string*) -
リクエストの追跡とログまたはトレースの関連付けに使用する、呼び出し元が指定できる任意の ID です。SDK はこれを `client-request-id` gRPC メタデータヘッダーとして送信し、自動生成することはありません。UUID など、リクエストごとに一意の値を使用してください。OpenTelemetry の trace-ID 形式（32 文字の小文字 16 進数）の値は、クライアントテレメトリでもトレース ID として使用されます。

</NextChannel>

**戻り値:**

*Promise&lt;FlushAllResponse&gt;*

このメソッドは **FlushAllResponse** オブジェクトに解決される promise を返します。

```javascript
{
    flush_all_ts: number,
    flush_all_tss: Record<string, number>,
    flush_all_msgs: Record<string, any>,
    cluster_info: FlushClusterInfo,
    status:  ResStatus
}
```

**パラメータ:**

- **flush_all_ts** (*number*) -
flush を識別する単一のハイブリッドタイムスタンプです。非推奨です。マルチクラスターデプロイメントでは **flush_all_tss** を優先してください。

- **flush_all_tss** (*Record&lt;string, number&gt;*) -
クラスター ID から、そのクラスターで flush が完了したハイブリッドタイムスタンプへのマッピングです。

- **flush_all_msgs** (*Record&lt;string, any&gt;*) -
物理チャネル名から、ストレージレイヤーで使用される flush メタデータへのマッピングです。

- **cluster_info** (*FlushClusterInfo*) -
flush に関与したクラスタートポロジーです。

    - **cluster_id** (*string*) -

        The クラスター identifier.

    - **cchannel** (*string*) -

        control channel 名です。

    - **pchannels** (*string[]*) -

        flush の対象となる physical channel です。

- **ResStatus**
**ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由です。この操作が成功した場合は空文字列のままです。

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

const res = await client.flushAll();
```

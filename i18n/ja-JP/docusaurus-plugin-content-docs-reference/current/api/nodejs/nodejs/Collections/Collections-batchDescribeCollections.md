---
title: "batchDescribeCollections() | Node.js"
slug: /node/node/Collections-batchDescribeCollections
sidebar_label: "batchDescribeCollections()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation retrieves スキーマ and metadata for multiple コレクション in a single call. | Node.js"
type: docx
token: ByKKdHVcAojjyZxKK3PciOTVnQg
sidebar_position: 23
keywords: 
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - zilliz
  - zilliz cloud
  - cloud
  - batchDescribeCollections()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# batchDescribeCollections()

This operation retrieves スキーマ and metadata for multiple コレクション in a single call.

```javascript
await milvusClient.batchDescribeCollections(data: BatchDescribeCollectionReq)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.batchDescribeCollections({
    collection_names: string[],
    db_name?: string,
    collectionIDs?: number[],
    timeout?: number,
    client_request_id?: string,
})
```

**パラメータ:**

- **collection_names** (*string[]*) -
**[REQUIRED]**
情報を取得するコレクションの名前です。

- **db_name** (*string*) -
データベースの名前です。省略可能です。

- **collectionIDs** (*number[]*) -
情報を取得するコレクションの ID です。省略可能です。

- **timeout** (*number*) -
RPC に使用できる時間をミリ秒単位で指定します。この値は省略可能です。undefined に設定した場合、クライアントはサーバーが応答するかエラーが発生するまで待機し続けます。デフォルトは undefined です。

- **client_request_id** (*string*) -
リクエスト追跡用のトレース ID です。省略可能です。

**戻り値:**

*Promise&lt;BatchDescribeCollectionResponse&gt;*

このメソッドは、**BatchDescribeCollectionResponse** オブジェクトに解決される promise を返します。

```javascript
{
    responses: DescribeCollectionResponse[],
    status:  ResStatus
}
```

**パラメータ:**

- **responses** (*DescribeCollectionResponse[]*) -
リクエストされたすべてのコレクションのスキーマとメタデータを含む配列です。エントリは、入力されたコレクション名と同じ順序で並びます。**DescribeCollectionResponse** のフィールドの完全なリファレンスについては、`describeCollection()` のドキュメントを参照してください。

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

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## 例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await client.batchDescribeCollections({
    collection_names: ['my_collection', 'hello_milvus'],
});
```

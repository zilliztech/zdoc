---
title: "batchDescribeCollections() | Node.js"
slug: /node/node/Collections-batchDescribeCollections
sidebar_label: "batchDescribeCollections()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、単一の呼び出しで複数の collection のスキーマとメタデータを取得します。 | Node.js"
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

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# batchDescribeCollections()

この操作は、単一の呼び出しで複数の collection のスキーマとメタデータを取得します。

```typescript
await milvusClient.batchDescribeCollections(data: BatchDescribeCollectionReq)
```

## リクエスト構文\{#request-syntax}

```typescript
await milvusClient.batchDescribeCollections({
    collection_names: string[],
    db_name?: string,
    collectionIDs?: number[],
    timeout?: number,
    client_request_id?: string,
})
```

**パラメータ:**

- **collection_names** (*string[]*) -<br/>
  **[必須]**<br/>
  説明対象の collection 名です。

- **db_name** (*string*) -<br/>
  データベース名です。任意です。

- **collectionIDs** (*number[]*) -<br/>
  説明対象の collection ID です。任意です。

- **timeout** (*number*) -<br/>
  RPC に許容する時間の長さ（ミリ秒）を指定する任意の値です。`undefined` に設定した場合、サーバーが応答するかエラーが発生するまでクライアントは待機し続けます。デフォルトは `undefined` です。

- **client_request_id** (*string*) -<br/>
  リクエスト追跡用のトレース ID です。任意です。

**戻り値** *Promise&lt;BatchDescribeCollectionResponse&gt;*

このメソッドは、**BatchDescribeCollectionResponse** オブジェクトに解決される promise を返します。

```typescript
{
    responses: DescribeCollectionResponse[],
    status:  ResStatus
}
```

**パラメータ:**

- **responses** (*DescribeCollectionResponse[]*) -<br/>
  リクエストされた各 collection のスキーマとメタデータを含む配列です。エントリは入力された collection 名と同じ順序で並びます。**DescribeCollectionResponse** の完全なフィールド参照については、`describeCollection()` のドキュメントを参照してください。

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

const res = await client.batchDescribeCollections({
    collection_names: ['collection1', 'collection2'],
});
```

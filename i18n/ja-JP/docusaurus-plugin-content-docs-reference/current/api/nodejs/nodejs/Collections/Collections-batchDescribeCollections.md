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

import Admonition from '@theme/Admonition';


# batchDescribeCollections()

This operation retrieves スキーマ and metadata for multiple コレクション in a single call.

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
  **[REQUIRED]**<br/>
  The names of the コレクション to describe.

- **db_name** (*string*) -<br/>
  データベース名です。任意です。

- **collectionIDs** (*number[]*) -<br/>
  The IDs of the コレクション to describe. Optional.

- **timeout** (*number*) -<br/>
  An optional duration of time in milliseconds to allow for the RPC. If it is set to undefined, the client keeps waiting until the server responds or an error occurs. Default is undefined.

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
  An array containing the スキーマ and metadata for every requested コレクション. Entries appear in the same order as the input コレクション names. For the full **DescribeCollectionResponse** field reference, refer to the `describeCollection()` doc.

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

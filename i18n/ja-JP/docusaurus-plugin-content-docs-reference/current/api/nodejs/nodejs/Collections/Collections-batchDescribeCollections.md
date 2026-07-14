---
title: "batchDescribeCollections() | Node.js"
slug: /node/node/Collections-batchDescribeCollections
sidebar_label: "batchDescribeCollections()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、複数のコレクションのスキーマとメタデータを1回の呼び出しで取得します。 | Node.js"
type: docx
token: ByKKdHVcAojjyZxKK3PciOTVnQg
sidebar_position: 23
keywords: 
  - AI Agent
  - セマンティック検索
  - 異常検知
  - sentence transformers
  - zilliz
  - zilliz cloud
  - クラウド
  - batchDescribeCollections()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# batchDescribeCollections()

この操作は、複数のコレクションのスキーマとメタデータを1回の呼び出しで取得します。

```typescript
await milvusClient.batchDescribeCollections(data: BatchDescribeCollectionReq)
```

## Request Syntax\{#request-syntax}

```typescript
await milvusClient.batchDescribeCollections({
    collection_names: string[],
    db_name?: string,
    collectionIDs?: number[],
    timeout?: number,
    client_request_id?: string,
})
```

**PARAMETERS:**

- **collection_names** (*string[]*) -
**[REQUIRED]**
詳細を取得するコレクションの名前です。

- **db_name** (*string*) -
データベース名です。オプションです。

- **collectionIDs** (*number[]*) -
詳細を取得するコレクションの ID です。オプションです。

- **timeout** (*number*) -
RPC に許可される時間の長さ（ミリ秒）のオプション値です。`undefined` に設定されている場合、クライアントはサーバーが応答するかエラーが発生するまで待機し続けます。デフォルトは `undefined` です。

- **client_request_id** (*string*) -
リクエスト追跡用のトレース ID です。オプションです。

**RETURNS** *Promise&lt;BatchDescribeCollectionResponse&gt;*

このメソッドは、**BatchDescribeCollectionResponse** オブジェクトに解決される promise を返します。

```typescript
{
    responses: DescribeCollectionResponse[],
    status:  ResStatus
}
```

**PARAMETERS:**

- **responses** (*DescribeCollectionResponse[]*) -
要求された各コレクションのスキーマとメタデータを含む配列です。エントリは入力したコレクション名と同じ順序で表示されます。**DescribeCollectionResponse** の完全なフィールドリファレンスについては、`describeCollection()` のドキュメントを参照してください。

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

const res = await client.batchDescribeCollections({
    collection_names: ['collection1', 'collection2'],
});
```

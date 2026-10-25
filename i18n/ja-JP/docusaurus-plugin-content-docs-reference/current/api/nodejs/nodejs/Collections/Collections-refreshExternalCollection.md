---
title: "refreshExternalCollection() | Node.js"
slug: /node/node/Collections-refreshExternalCollection
sidebar_label: "refreshExternalCollection()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、外部コレクションのデータ更新をトリガーします。外部データソースが更新され、Milvus にデータを再読み込みさせたい場合に使用します。 | Node.js"
type: docx
token: JoiWdRIFcojRI4xVXnCclEoVnh2
sidebar_position: 35
keywords: 
  - 音声類似検索
  - Elastic ベクトルデータベース
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - refreshExternalCollection()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# refreshExternalCollection()

この操作は、外部コレクションのデータ更新をトリガーします。外部データソースが更新され、Milvus にデータを再読み込みさせたい場合に使用します。

```typescript
await milvusClient.refreshExternalCollection(data: RefreshExternalCollectionReq)
```

## リクエスト構文\{#request-syntax}

```typescript
await milvusClient.refreshExternalCollection({
    collection_name: string,
    external_source?: string,
    external_spec?: string,
    db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**パラメーター:**

- **collection_name** (*string*) -<br/>
  **[必須]**<br/>
  更新する外部コレクションの名前です。

- **external_source** (*string*) -<br/>
  新しい外部ソースパスです。省略可能です。指定した場合、コレクションはこの新しいソースから更新されます。

- **external_spec** (*string*) -<br/>
  新しい外部仕様設定です。省略可能です。指定した場合、コレクションはこの新しい仕様を使用します。

- **db_name** (*string*) -<br/>
  データベースの名前です。省略可能です。

- **timeout** (*number*) -<br/>
  RPC に許可する時間をミリ秒単位で指定する省略可能な値です。undefined に設定した場合、クライアントはサーバーが応答するかエラーが発生するまで待機し続けます。デフォルトは undefined です。

- **client_request_id** (*string*) -<br/>
  リクエスト追跡用のトレース ID です。省略可能です。

**戻り値** *Promise&lt;RefreshExternalCollectionResponse&gt;*

このメソッドは、**RefreshExternalCollectionResponse** オブジェクトに解決される promise を返します。

```typescript
{
    job_id: string,
    status:  ResStatus
}
```

**パラメーター:**

- **job_id** (*string*) -<br/>
  非同期更新ジョブの識別子です。この値を `getRefreshExternalCollectionProgress()` に渡して、完了までポーリングします。

- **ResStatus**<br/>
  **ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す値です。この操作が成功した場合は空文字列のままです。

## 例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await client.refreshExternalCollection({
    collection_name: 'my_external_collection',
    external_source: 's3://bucket/path',
});
```

---
title: "refreshExternalCollection() | Node.js"
slug: /node/node/Collections-refreshExternalCollection
sidebar_label: "refreshExternalCollection()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、external collection のデータ更新をトリガーします。外部データソースが更新され、Milvus にデータを再読み込みさせたい場合に使用します。 | Node.js"
type: docx
token: JoiWdRIFcojRI4xVXnCclEoVnh2
sidebar_position: 31
keywords: 
  - 音声類似検索
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - refreshExternalCollection()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# refreshExternalCollection()

この操作は、external collection のデータ更新をトリガーします。外部データソースが更新され、Milvus にデータを再読み込みさせたい場合に使用します。

```typescript
await milvusClient.refreshExternalCollection(data: RefreshExternalCollectionReq)
```

## Request Syntax\{#request-syntax}

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

**PARAMETERS:**

- **collection_name** (*string*) -<br/>
  **[REQUIRED]**<br/>
  更新する external collection の名前。

- **external_source** (*string*) -<br/>
  任意の新しい外部ソースパス。指定した場合、collection はこの新しいソースから更新されます。

- **external_spec** (*string*) -<br/>
  任意の新しい external spec 設定。指定した場合、collection はこの新しい spec を使用します。

- **db_name** (*string*) -<br/>
  データベース名。任意です。

- **timeout** (*number*) -<br/>
  RPC に許可する時間の長さ（ミリ秒）。`undefined` に設定されている場合、client はサーバーから応答があるかエラーが発生するまで待機し続けます。デフォルトは `undefined` です。

- **client_request_id** (*string*) -<br/>
  リクエスト追跡用のトレース ID。任意です。

**RETURNS** *Promise&lt;RefreshExternalCollectionResponse&gt;*

このメソッドは、**RefreshExternalCollectionResponse** オブジェクトに解決される promise を返します。

```typescript
{
    job_id: string,
    status:  ResStatus
}
```

**PARAMETERS:**

- **job_id** (*string*) -<br/>
  非同期更新ジョブの識別子。この値を `getRefreshExternalCollectionProgress()` に渡して、完了するまでポーリングします。

- **ResStatus**<br/>
  **ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコード。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。

## Example\{#example}

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

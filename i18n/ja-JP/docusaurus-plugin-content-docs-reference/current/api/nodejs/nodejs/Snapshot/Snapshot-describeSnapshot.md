---
title: "describeSnapshot() | Node.js"
slug: /node/node/Snapshot-describeSnapshot
sidebar_label: "describeSnapshot()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、特定の snapshot に関する詳細情報を取得します。 | Node.js"
type: docx
token: KNOwdbcYXoVwGEx8ysScLO1CnUd
sidebar_position: 2
keywords: 
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search
  - zilliz
  - zilliz cloud
  - cloud
  - describeSnapshot()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# describeSnapshot()

この操作は、特定の snapshot に関する詳細情報を取得します。

```typescript
await milvusClient.describeSnapshot(data: DescribeSnapshotReq)
```

## Request Syntax\{#request-syntax}

```typescript
await milvusClient.describeSnapshot({
    collection_name: string,
    snapshot_name: string,
    db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**PARAMETERS:**

- **collection_name** (*string*) -<br/>
  **[REQUIRED]**<br/>
  snapshot が属する collection の名前。

- **snapshot_name** (*string*) -<br/>
  **[REQUIRED]**<br/>
  説明対象の snapshot の名前。

- **db_name** (*string*) -<br/>
  データベースの名前。省略可能です。

- **timeout** (*number*) -<br/>
  RPC に許可する時間の長さ（ミリ秒）の省略可能な値です。`undefined` に設定されている場合、サーバーが応答するかエラーが発生するまでクライアントは待機し続けます。デフォルトは `undefined` です。

- **client_request_id** (*string*) -<br/>
  リクエスト追跡用のトレース ID。省略可能です。

**RETURNS** *Promise&lt;DescribeSnapshotResponse&gt;*

このメソッドは、**DescribeSnapshotResponse** オブジェクトに解決される promise を返します。

```typescript
{
    name: string,
    description: string,
    collection_name: string,
    partition_names: string[],
    create_ts: string,
    s3_location: string,
    status:  ResStatus
}
```

**PARAMETERS:**

- **name** (*string*) -<br/>
  snapshot の名前。

- **description** (*string*) -<br/>
  snapshot 作成時に指定された説明、指定されなかった場合は空文字列です。

- **collection_name** (*string*) -<br/>
  snapshot を所有する collection。

- **partition_names** (*string[]*) -<br/>
  snapshot によって取得された partition 名。

- **create_ts** (*string*) -<br/>
  snapshot が作成された時点のハイブリッドタイムスタンプ。

- **s3_location** (*string*) -<br/>
  snapshot データが永続化されるオブジェクトストア URI。

- **ResStatus**<br/>
  **ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコード。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す内容。この操作が成功した場合は空文字列のままです。

## Example\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await client.describeSnapshot({
    collection_name: 'my_collection',
    snapshot_name: 'snapshot_2024_01',
});
```

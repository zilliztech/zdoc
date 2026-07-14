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
  - vector 検索アルゴリズム
  - 質問応答システム
  - llm-as-a-judge
  - ハイブリッド vector 検索
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

- **collection_name** (*string*) -
**[REQUIRED]**
snapshot が属する collection の名前。

- **snapshot_name** (*string*) -
**[REQUIRED]**
詳細を取得する snapshot の名前。

- **db_name** (*string*) -
database の名前。オプションです。

- **timeout** (*number*) -
RPC に許可する任意の時間（ミリ秒）。`undefined` に設定すると、サーバーが応答するかエラーが発生するまでクライアントは待機し続けます。デフォルトは `undefined` です。

- **client_request_id** (*string*) -
リクエスト追跡用のトレース ID。オプションです。

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

- **name** (*string*) -
snapshot 名。

- **description** (*string*) -
snapshot 作成時に指定された説明。指定されていない場合は空文字列です。

- **collection_name** (*string*) -
この snapshot を所有する collection。

- **partition_names** (*string[]*) -
snapshot によって取得された partition 名。

- **create_ts** (*string*) -
snapshot が作成された時点の hybrid timestamp。

- **s3_location** (*string*) -
snapshot データが永続化されるオブジェクトストア URI。

- **ResStatus**
**ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示します。この操作が成功した場合は空文字列のままです。

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

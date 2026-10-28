---
title: "describeSnapshot() | Node.js"
slug: /node/node/Snapshot-describeSnapshot
sidebar_label: "describeSnapshot()"
beta: ON REQUEST
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、特定のスナップショットに関する詳細情報を取得します。 | Node.js"
type: docx
token: KNOwdbcYXoVwGEx8ysScLO1CnUd
sidebar_position: 2
keywords: 
  - ベクトル検索アルゴリズム
  - 質問応答システム
  - llm-as-a-judge
  - ハイブリッドベクトル検索
  - zilliz
  - zilliz cloud
  - cloud
  - describeSnapshot()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# describeSnapshot()

この操作は、特定のスナップショットに関する詳細情報を取得します。

```typescript
await milvusClient.describeSnapshot(data: DescribeSnapshotReq)
```

## リクエスト構文\{#request-syntax}

```typescript
await milvusClient.describeSnapshot({
    collection_name: string,
    snapshot_name: string,
    db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**パラメーター:**

- **collection_name** (*string*) -<br/>
  **[必須]**<br/>
  スナップショットが属するコレクションの名前。

- **snapshot_name** (*string*) -<br/>
  **[必須]**<br/>
  詳細を取得するスナップショットの名前。

- **db_name** (*string*) -<br/>
  データベースの名前。任意です。

- **timeout** (*number*) -<br/>
  RPC に許可する時間をミリ秒単位で指定する任意の値です。undefined に設定すると、クライアントはサーバーが応答するかエラーが発生するまで待機し続けます。デフォルトは undefined です。

- **client_request_id** (*string*) -<br/>
  リクエスト追跡用のトレース ID です。任意です。

**戻り値** *Promise&lt;DescribeSnapshotResponse&gt;*

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

**パラメーター:**

- **name** (*string*) -<br/>
  スナップショットの名前。

- **description** (*string*) -<br/>
  スナップショット作成時に指定された説明。指定されていない場合は空文字列です。

- **collection_name** (*string*) -<br/>
  スナップショットを所有するコレクション。

- **partition_names** (*string[]*) -<br/>
  スナップショットによって取得されたパーティション名。

- **create_ts** (*string*) -<br/>
  スナップショットが作成された時点のハイブリッドタイムスタンプ。

- **s3_location** (*string*) -<br/>
  スナップショットデータが永続化されるオブジェクトストア URI。

- **ResStatus**<br/>
  **ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコード。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示します。この操作が成功した場合は空文字列のままです。

## 例\{#example}

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

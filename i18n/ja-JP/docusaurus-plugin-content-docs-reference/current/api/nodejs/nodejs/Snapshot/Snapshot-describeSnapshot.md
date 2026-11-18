---
title: "describeSnapshot() | Node.js"
slug: /node/node/Snapshot-describeSnapshot
sidebar_label: "describeSnapshot()"
beta: false
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

# describeSnapshot()

この操作は、特定のスナップショットに関する詳細情報を取得します。

```javascript
await milvusClient.describeSnapshot(data: DescribeSnapshotReq)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.describeSnapshot({
    collection_name: string,
    snapshot_name: string,
    db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**パラメーター:**

- **collection_name** (*string*) -
**[必須]**
スナップショットが属するコレクションの名前です。

- **snapshot_name** (*string*) -
**[必須]**
詳細を取得するスナップショットの名前です。

- **db_name** (*string*) -
データベースの名前です。省略可能です。

- **timeout** (*number*) -
RPC に許容される時間をミリ秒単位で指定します。省略可能です。undefined に設定すると、サーバーが応答するかエラーが発生するまでクライアントは待機します。デフォルトは undefined です。

- **client_request_id** (*string*) -
リクエスト追跡用のトレース ID です。省略可能です。

**戻り値:**

*Promise&lt;DescribeSnapshotResponse&gt;*

このメソッドは、**DescribeSnapshotResponse** オブジェクトに解決される promise を返します。

```javascript
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

- **name** (*string*) -
スナップショットの名前です。

- **description** (*string*) -
スナップショット作成時に指定された説明です。指定されなかった場合は空文字列です。

- **collection_name** (*string*) -
スナップショットを所有するコレクションです。

- **partition_names** (*string[]*) -
スナップショットによって取得されたパーティション名です。

- **create_ts** (*string*) -
スナップショットが作成されたハイブリッドタイムスタンプです。

- **s3_location** (*string*) -
スナップショットデータが永続化されるオブジェクトストア URI です。

- **ResStatus**
**ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコード。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示します。この操作が成功した場合は空文字列のままです。


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

const res = await client.describeSnapshot({
    collection_name: 'my_collection',
    snapshot_name: 'snapshot_2024_01',
});
```

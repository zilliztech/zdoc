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
sidebar_position: 31
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

# refreshExternalCollection()

この操作は、外部コレクションのデータ更新をトリガーします。外部データソースが更新され、Milvus にデータを再読み込みさせたい場合に使用します。

```javascript
await milvusClient.refreshExternalCollection(data: RefreshExternalCollectionReq)
```

## リクエスト構文\{#request-syntax}

```javascript
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

<NextChannel action="exclude">

- **collection_name** (*string*) -
**[必須]**
更新する外部コレクションの名前です。

- **external_source** (*string*) -
新しい外部ソースパスを指定するオプションです。指定した場合、コレクションはこの新しいソースからリフレッシュされます。

</NextChannel>

<NextChannel action="include">

- **collection_name** (*string*) -
**[必須]**
更新する外部コレクションの名前です。

- **external_source** (*string*) -
新しい外部ソースパスを指定するオプションです。指定した場合、コレクションはこの新しいソースからリフレッシュされます。`external_source` と `external_spec` は両方を指定するか、両方を省略してください。両方を省略した場合、リフレッシュは永続化されたソースと仕様を再利用します。

</NextChannel>

Zilliz Cloud では、`external_source` は `volume://<volume_name>/<path>` と `milvus://<instance_id>/<db_name>/<collection_name>` の 2 つのスキームを受け入れます。`volume://` ソースの場合、`external_source` と `external_spec` は両方を指定するか、両方を省略する必要があります。両方を省略した場合、リフレッシュは以前に永続化されたソース設定を再利用し、最新データも引き続き同期されます。`milvus://` ソースの場合も同じルールが適用されます。省略すると永続化されたソースが再利用され、リフレッシュは同期する前にソースクラスターを再スナップショットします。

<NextChannel action="exclude">

- **external_spec** (*string*) -
新しい外部仕様設定を指定するオプションです。指定した場合、コレクションはこの新しい仕様を使用します。

</NextChannel>

<NextChannel action="include">

- **external_spec** (*string*) -
新しい外部仕様設定を指定するオプションです。指定した場合、コレクションはこの新しい仕様を使用します。`format` に指定できる値は `parquet`、`vortex`、`lance-table`、`iceberg-table`、`milvus-table` です。`milvus-table` の場合は、`external_source` に Milvus スナップショットメタデータの JSON パス（例: `s3://bucket/snapshots/{collection_id}/metadata/{snapshot_id}.json`）を設定してください。

</NextChannel>

Zilliz Cloud では、`milvus://` ソースの場合、`format` は `milvus-table` である必要があります（または省略します）。その他のソースの場合、`format` が一致する仕様（`parquet`、`vortex`、`lance-table`、`iceberg-table`）を指定してください。

<NextChannel action="exclude">

- **db_name** (*string*) -
データベースの名前です。任意です。

- **timeout** (*number*) -
RPC に許可する時間をミリ秒単位で指定するオプションです。undefined に設定した場合、クライアントはサーバーが応答するかエラーが発生するまで待機し続けます。デフォルトは undefined です。

- **client_request_id** (*string*) -
リクエストを追跡するためのトレース ID です。任意です。

</NextChannel>

<NextChannel action="include">

- **db_name** (*string*) -
データベースの名前です。任意です。

- **timeout** (*number*) -
RPC に許可する時間をミリ秒単位で指定するオプションです。undefined に設定した場合、クライアントはサーバーが応答するかエラーが発生するまで待機し続けます。デフォルトは undefined です。

- **client_request_id** (*string*) -
リクエストの追跡やログ・トレースとの関連付けのために呼び出し元が指定するオプションの ID です。SDK はこれを `client-request-id` gRPC メタデータヘッダーとして送信し、自動生成することはありません。リクエストごとに UUID などの一意の値を使用してください。OpenTelemetry のトレース ID 形式（32 文字の小文字 16 進数）の値は、クライアントテレメトリーでもトレース ID として使用されます。

</NextChannel>

**戻り値:**

*Promise&lt;RefreshExternalCollectionResponse&gt;*

このメソッドは、**RefreshExternalCollectionResponse** オブジェクトに解決される promise を返します。

```javascript
{
    job_id: string,
    status:  ResStatus
}
```

**パラメーター:**

- **job_id** (*string*) -
非同期リフレッシュジョブの識別子です。完了をポーリングするには、この値を `getRefreshExternalCollectionProgress()` に渡します。

- **ResStatus**
**ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す値です。この操作が成功した場合は空文字列のままです。

**例外:**

- **Error**

    この操作中にエラーが発生すると、この例外がスローされます。

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

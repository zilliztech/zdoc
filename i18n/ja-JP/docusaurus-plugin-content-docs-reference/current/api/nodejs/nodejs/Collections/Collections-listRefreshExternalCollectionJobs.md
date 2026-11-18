---
title: "listRefreshExternalCollectionJobs() | Node.js"
slug: /node/node/Collections-listRefreshExternalCollectionJobs
sidebar_label: "listRefreshExternalCollectionJobs()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、外部コレクションのすべてのリフレッシュジョブを一覧表示します。コレクション名とデータベース名でフィルターできます。 | Node.js"
type: docx
token: AG5zdQCpXoy11MxWgD0ciYBRnJb
sidebar_position: 30
keywords: 
  - AI エージェント
  - セマンティック検索
  - 異常検知
  - sentence transformers
  - zilliz
  - zilliz cloud
  - クラウド
  - listRefreshExternalCollectionJobs()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# listRefreshExternalCollectionJobs()

この操作では、外部コレクションのすべてのリフレッシュジョブを一覧表示します。コレクション名とデータベース名でフィルターできます。

```javascript
await milvusClient.listRefreshExternalCollectionJobs(data?: ListRefreshExternalCollectionJobsReq)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.listRefreshExternalCollectionJobs({
    collection_name?: string,
    db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**パラメーター:**

- **collection_name** (*string*) -
コレクション名でフィルターするためのオプションです。

- **db_name** (*string*) -
データベース名でフィルターするためのオプションです。

- **timeout** (*number*) -
RPC の実行を許可する時間をミリ秒単位で指定するオプションです。undefined に設定した場合、クライアントはサーバーが応答するかエラーが発生するまで待機し続けます。デフォルトは undefined です。

- **client_request_id** (*string*) -
リクエスト追跡用のトレース ID です。任意です。

**戻り値:**

*Promise&lt;ListRefreshExternalCollectionJobsResponse&gt;*

このメソッドは、**ListRefreshExternalCollectionJobsResponse** オブジェクトに解決される Promise を返します。

```javascript
{
    jobs: RefreshExternalCollectionJobInfo[],
    status:  ResStatus
}
```

**パラメーター:**

- **jobs** (*RefreshExternalCollectionJobInfo[]*) -

要求されたデータベースおよびコレクションのフィルターに一致するリフレッシュジョブのリストです。RefreshExternalCollectionJobInfo のフィールドの完全なリファレンスについては、`getRefreshExternalCollectionProgress()` のドキュメントを参照してください。

- **ResStatus**
**ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作の結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示します。この操作が成功した場合は空の文字列のままです。


**例外:**

- **Error**

    この操作中に何らかのエラーが発生した場合、この例外が発生します。

## 例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await client.listRefreshExternalCollectionJobs({
    collection_name: 'my_external_collection',
});
```

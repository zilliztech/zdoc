---
title: "getFlushAllState() | Node.js"
slug: /node/node/Management-getFlushAllState
sidebar_label: "getFlushAllState()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、flush-all 操作が完了したかどうかを確認します。 | Node.js"
type: docx
token: WgfTdXbMmoFhO9xBpencxLRRnbb
sidebar_position: 25
keywords: 
  - 画像類似検索
  - コンテキストウィンドウ
  - 自然言語検索
  - 類似検索
  - zilliz
  - zilliz cloud
  - cloud
  - getFlushAllState()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# getFlushAllState()

この操作は、flush-all 操作が完了したかどうかを確認します。

```javascript
await milvusClient.getFlushAllState(data: GetFlushAllStateReq)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.getFlushAllState({
    flush_all_ts?: number,
    flush_all_tss?: Record\<string, number\>,
    db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**パラメータ:**

<NextChannel action="exclude">

- **flush_all_ts** (*number*) -
flush-all のタイムスタンプです。省略可能で、非推奨です。

- **flush_all_tss** (*Record&lt;string, number&gt;*) -
データベース名と flush-all のタイムスタンプを対応付けるマップです。任意です。

- **db_name** (*string*) -
データベースの名前です。省略可能で、非推奨です。

- **timeout** (*number*) -
RPC に許可する時間をミリ秒単位で指定するオプションです。undefined に設定した場合、クライアントはサーバーが応答するかエラーが発生するまで待機し続けます。デフォルトは undefined です。

- **client_request_id** (*string*) -
リクエスト追跡用のトレース ID です。任意です。

</NextChannel>

<NextChannel action="include">

- **flush_all_ts** (*number*) -
flush-all のタイムスタンプです。省略可能で、非推奨です。

- **flush_all_tss** (*Record&lt;string, number&gt;*) -
データベース名と flush-all のタイムスタンプを対応付けるマップです。任意です。

- **db_name** (*string*) -
データベースの名前です。省略可能で、非推奨です。

- **timeout** (*number*) -
RPC に許可する時間をミリ秒単位で指定するオプションです。undefined に設定した場合、クライアントはサーバーが応答するかエラーが発生するまで待機し続けます。デフォルトは undefined です。

- **client_request_id** (*string*) -
リクエストの追跡とログまたはトレースの相関付けに使用する、呼び出し元が指定する任意の ID です。SDK はこれを `client-request-id` gRPC メタデータヘッダーとして送信し、この ID を自動生成することはありません。リクエストごとに、UUID などの一意の値を使用してください。OpenTelemetry のトレース ID 形式（32 文字の小文字 16 進数）の値は、クライアントテレメトリでもトレース ID として使用されます。

</NextChannel>

**戻り値:**

*Promise&lt;GetFlushAllStateResponse&gt;*

このメソッドは、**GetFlushAllStateResponse** オブジェクトに解決される promise を返します。

```javascript
{
    flushed: boolean,
    status:  ResStatus
}
```

**パラメータ:**

- **flushed** (*boolean*) -
指定されたタイムスタンプで識別される flush-all 操作が完全に完了したかどうかを示します。すべてのチャネルが要求された flush タイムスタンプに到達した場合は **true**、それ以外の場合は **false** です。

- **ResStatus**
**ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由です。この操作が成功した場合は空文字列のままです。

**例外:**

- **Error**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await client.getFlushAllState({
    flush_all_tss: { db1: 123456789 },
});
```

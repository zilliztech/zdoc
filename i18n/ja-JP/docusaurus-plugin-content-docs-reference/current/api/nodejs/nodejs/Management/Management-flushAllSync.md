---
title: "flushAllSync() | Node.js"
slug: /node/node/Management-flushAllSync
sidebar_label: "flushAllSync()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation flushes all コレクション and waits until the flush operation is completed. It internally calls flushAll followed by polling getFlushAllState until the flush is complete. | Node.js"
type: docx
token: HoRIdZtHjosja7xOdNPc8CConrb
sidebar_position: 23
keywords: 
  - milvus db
  - milvus ベクトル db
  - Zilliz Cloud
  - milvus とは
  - zilliz
  - zilliz cloud
  - cloud
  - flushAllSync()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# flushAllSync()

This operation flushes all コレクション and waits until the flush operation is completed. It internally calls flushAll followed by polling getFlushAllState until the flush is complete.

```javascript
await milvusClient.flushAllSync(data?: FlushAllReq)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.flushAllSync({
    db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**パラメーター:**

- **db_name** (*string*) -
データベースの名前です。任意です。

- **timeout** (*number*) -
RPC の実行を許可する時間をミリ秒単位で指定するオプションです。undefined に設定した場合、クライアントはサーバーが応答するかエラーが発生するまで待機し続けます。デフォルトは undefined です。

- **client_request_id** (*string*) -
リクエスト追跡用のトレース ID です。任意です。

**戻り値:**

*Promise&lt;GetFlushAllStateResponse&gt;*

このメソッドは、**GetFlushAllStateResponse** オブジェクトに解決される promise を返します。

```javascript
{
    flushed: boolean,
    status:  ResStatus
}
```

**パラメーター:**

- **flushed** (*boolean*) -
flush-all 操作が完全に完了したかどうかを示します。`flushAllSync()` は完了するまでブロックするため、成功した場合、この値は **true** です。

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

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## 例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await client.flushAllSync();
```

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

import Admonition from '@theme/Admonition';


# flushAllSync()

This operation flushes all コレクション and waits until the flush operation is completed. It internally calls flushAll followed by polling getFlushAllState until the flush is complete.

```typescript
await milvusClient.flushAllSync(data?: FlushAllReq)
```

## リクエスト構文\{#request-syntax}

```typescript
await milvusClient.flushAllSync({
    db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**パラメーター:**

- **db_name** (*string*) -<br/>
  データベース名です。省略可能です。

- **timeout** (*number*) -<br/>
  An optional duration of time in milliseconds to allow for the RPC. If it is set to undefined, the client keeps waiting until the server responds or an error occurs. Default is undefined.

- **client_request_id** (*string*) -<br/>
  リクエスト追跡用のトレース ID です。省略可能です。

**戻り値** *Promise&lt;GetFlushAllStateResponse&gt;*

このメソッドは、**GetFlushAllStateResponse** オブジェクトに解決される promise を返します。

```typescript
{
    flushed: boolean,
    status:  ResStatus
}
```

**パラメーター:**

- **flushed** (*boolean*) -<br/>
  flush-all 操作が完全に完了したかどうかを示します。`flushAllSync()` は完了までブロックするため、成功時にはこの値は **true** です。

- **ResStatus**<br/>
  **ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由です。この操作が成功した場合は空文字列のままです。

## 例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await client.flushAllSync();
```

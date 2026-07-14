---
title: "flushAllSync() | Node.js"
slug: /node/node/Management-flushAllSync
sidebar_label: "flushAllSync()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作はすべての collection を flush し、flush 操作が完了するまで待機します。内部的には flushAll を呼び出し、その後 flush が完了するまで getFlushAllState をポーリングします。 | Node.js"
type: docx
token: HoRIdZtHjosja7xOdNPc8CConrb
sidebar_position: 23
keywords: 
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - Milvus とは
  - zilliz
  - zilliz cloud
  - cloud
  - flushAllSync()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# flushAllSync()

この操作はすべての collection を flush し、flush 操作が完了するまで待機します。内部的には flushAll を呼び出し、その後 flush が完了するまで getFlushAllState をポーリングします。

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

**パラメータ:**

- **db_name** (*string*) -
データベースの名前です。省略可能です。

- **timeout** (*number*) -
RPC に許可する時間の長さをミリ秒単位で指定する省略可能な値です。`undefined` に設定されている場合、クライアントはサーバーが応答するかエラーが発生するまで待機し続けます。デフォルトは `undefined` です。

- **client_request_id** (*string*) -
リクエスト追跡用のトレース ID です。省略可能です。

**戻り値** *Promise&lt;GetFlushAllStateResponse&gt;*

このメソッドは **GetFlushAllStateResponse** オブジェクトに解決される promise を返します。

```typescript
{
    flushed: boolean,
    status:  ResStatus
}
```

**パラメータ:**

- **flushed** (*boolean*) -
flush-all 操作が完全に完了したかどうかを示します。`flushAllSync()` は完了するまでブロックするため、成功時にはこの値は **true** になります。

- **ResStatus**
**ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示します。この操作が成功した場合は空文字列のままです。

## 例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await client.flushAllSync();
```

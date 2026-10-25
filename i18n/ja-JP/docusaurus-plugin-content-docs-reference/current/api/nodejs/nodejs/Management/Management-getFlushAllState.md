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

import Admonition from '@theme/Admonition';


# getFlushAllState()

この操作は、flush-all 操作が完了したかどうかを確認します。

```typescript
await milvusClient.getFlushAllState(data: GetFlushAllStateReq)
```

## リクエスト構文\{#request-syntax}

```typescript
await milvusClient.getFlushAllState({
    flush_all_ts?: number,
    flush_all_tss?: Record\<string, number\>,
    db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**パラメータ:**

- **flush_all_ts** (*number*) -<br/>
  flush-all タイムスタンプです。任意であり、非推奨です。

- **flush_all_tss** (*Record&lt;string, number&gt;*) -<br/>
  A map of データベース names to flush-all timestamps. Optional.

- **db_name** (*string*) -<br/>
  The name of the データベース. Optional and deprecated.

- **timeout** (*number*) -<br/>
  An optional duration of time in milliseconds to allow for the RPC. If it is set to undefined, the client keeps waiting until the server responds or an error occurs. Default is undefined.

- **client_request_id** (*string*) -<br/>
  リクエスト追跡用のトレース ID です。任意です。

**戻り値** *Promise&lt;GetFlushAllStateResponse&gt;*

このメソッドは、**GetFlushAllStateResponse** オブジェクトに解決される promise を返します。

```typescript
{
    flushed: boolean,
    status:  ResStatus
}
```

**パラメータ:**

- **flushed** (*boolean*) -<br/>
  指定されたタイムスタンプで識別される flush-all 操作が完全に完了したかどうかを示します。すべての channel が要求された flush タイムスタンプに到達すると **true**、それ以外は **false** です。

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

const res = await client.getFlushAllState({
    flush_all_tss: { db1: 123456789 },
});
```

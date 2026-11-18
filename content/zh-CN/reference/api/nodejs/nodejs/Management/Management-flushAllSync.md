---
title: "flushAllSync() | Node.js"
slug: /node/node/Management-flushAllSync
sidebar_label: "flushAllSync()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会刷新所有 Collection，并等待刷新操作完成。它会在内部先调用 flushAll，然后轮询 getFlushAllState，直到刷新完成。 | Node.js"
type: docx
token: HoRIdZtHjosja7xOdNPc8CConrb
sidebar_position: 23
keywords: 
  - milvus 数据库
  - milvus 向量数据库
  - Zilliz Cloud
  - 什么是 milvus
  - zilliz
  - zilliz cloud
  - 云
  - flushAllSync()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# flushAllSync()

此操作会刷新所有 Collection，并等待刷新操作完成。它会在内部先调用 flushAll，然后轮询 getFlushAllState，直到刷新完成。

```javascript
await milvusClient.flushAllSync(data?: FlushAllReq)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.flushAllSync({
    db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**参数：**

- **db_name** (*string*) -
Database 的名称。可选。

- **timeout** (*number*) -
允许 RPC 执行的可选时长，以毫秒为单位。如果将其设置为 undefined，则客户端会持续等待，直到服务器响应或发生错误。默认值为 undefined。

- **client_request_id** (*string*) -
用于请求跟踪的 trace ID。可选。

**返回：**

*Promise&lt;GetFlushAllStateResponse&gt;*

此方法返回一个 promise，该 promise 会解析为 **GetFlushAllStateResponse** 对象。

```javascript
{
    flushed: boolean,
    status:  ResStatus
}
```

**参数：**

- **flushed** (*boolean*) -
flush-all 操作是否已完全完成。由于 `flushAllSync()` 会阻塞直至完成，因此成功时该值为 **true**。

- **ResStatus**
一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，该值保持为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误代码。如果此操作成功，该值保持为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的原因。如果此操作成功，该值保持为空字符串。


**异常：**

- **Error**

    此操作期间发生任何错误时，都会引发此异常。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await client.flushAllSync();
```

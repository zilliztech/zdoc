---
title: "pinSnapshotData() | Node.js"
slug: /node/node/Snapshot-pinSnapshotData
sidebar_label: "pinSnapshotData()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会固定快照数据，防止其被垃圾回收。使用此操作可确保快照在恢复时仍可用。 | Node.js"
type: docx
token: Bx6FdwVlUoqZjVxZwSFcnUr2nDe
sidebar_position: 7
keywords: 
  - Agentic RAG
  - rag llm architecture
  - private llms
  - nn search
  - zilliz
  - zilliz cloud
  - cloud
  - pinSnapshotData()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# pinSnapshotData()

此操作会固定快照数据，防止其被垃圾回收。使用此操作可确保快照在恢复时仍可用。

```typescript
await milvusClient.pinSnapshotData(data: PinSnapshotDataReq)
```

## 请求语法\{#request-syntax}

```typescript
await milvusClient.pinSnapshotData({
    collection_name: string,
    snapshot_name: string,
    ttl_seconds?: number | string,
    db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**参数：**

- **collection_name** (*string*) -<br/>
  **[必填]**<br/>
  快照所属集合的名称。

- **snapshot_name** (*string*) -<br/>
  **[必填]**<br/>
  要固定的快照名称。

- **ttl_seconds** (*number | string*) -<br/>
  可选的固定 TTL，单位为秒。如果未指定，则该快照将被无限期固定。

- **db_name** (*string*) -<br/>
  数据库名称。可选。

- **timeout** (*number*) -<br/>
  RPC 允许的可选时长，单位为毫秒。如果设置为 undefined，客户端将持续等待，直到服务器响应或发生错误。默认值为 undefined。

- **client_request_id** (*string*) -<br/>
  用于请求跟踪的 trace ID。可选。

**返回值** *Promise&lt;PinSnapshotDataResponse&gt;*

此方法返回一个 promise，该 promise 会解析为一个 **PinSnapshotDataResponse** 对象。

```typescript
{
    pin_id: string,
    status:  ResStatus
}
```

**参数：**

- **pin_id** (*string*) -<br/>
  固定租约的标识符。在其 TTL 到期前，将此值传递给 `unpinSnapshotData()` 以释放固定。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则该值始终为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误码。如果此操作成功，则该值始终为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的说明。如果此操作成功，则该值始终为空字符串。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await client.pinSnapshotData({
    collection_name: 'my_collection',
    snapshot_name: 'snapshot_2024_01',
});
```

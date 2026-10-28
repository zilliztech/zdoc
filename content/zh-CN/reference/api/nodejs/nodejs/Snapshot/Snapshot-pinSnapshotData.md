---
title: "pinSnapshotData() | Node.js"
slug: /node/node/Snapshot-pinSnapshotData
sidebar_label: "pinSnapshotData()"
beta: ON REQUEST
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会固定快照数据，以防止其被垃圾回收。使用此操作可确保快照保持可用以用于恢复。 | Node.js"
type: docx
token: Bx6FdwVlUoqZjVxZwSFcnUr2nDe
sidebar_position: 7
keywords: 
  - 智能体 RAG
  - RAG LLM 架构
  - 私有 LLM
  - 最近邻搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - pinSnapshotData()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# pinSnapshotData()

此操作会固定快照数据，以防止其被垃圾回收。使用此操作可确保快照保持可用以用于恢复。

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

- **collection_name** （*string*） -<br/>
  **[必填]**<br/>
  快照所属的 Collection 名称。

- **snapshot_name** （*string*） -<br/>
  **[必填]**<br/>
  要固定的快照名称。

- **ttl_seconds** （*number | string*） -<br/>
  可选的固定 TTL，单位为秒。如果未指定，快照会被无限期固定。

- **db_name** （*string*） -<br/>
  Database 名称。可选。

- **timeout** （*number*） -<br/>
  可选的 RPC 持续时间，单位为毫秒。如果将其设置为 undefined，客户端会持续等待，直到服务器响应或发生错误。默认值为 undefined。

- **client_request_id** （*string*） -<br/>
  用于请求跟踪的追踪 ID。可选。

**返回** *Promise&lt;PinSnapshotDataResponse&gt;*

此方法返回一个 Promise，该 Promise 会解析为 **PinSnapshotDataResponse** 对象。

```typescript
{
    pin_id: string,
    status:  ResStatus
}
```

**参数：**

- **pin_id** （*string*） -<br/>
  固定租约的标识符。将此值传递给 `unpinSnapshotData()`，可在固定 TTL 到期前释放固定。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

    - **code** （*number*） -

        表示操作结果的代码。如果此操作成功，该值保持为 **0**。

    - **error_code** （*string* | *number*） -

        指示所发生错误的错误代码。如果此操作成功，该值保持为 **Success**。

    - **reason** （*string*） -

        指示所报告错误原因的说明。如果此操作成功，该值为空字符串。

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

---
title: "pinSnapshotData() | Node.js"
slug: /node/node/Snapshot-pinSnapshotData
sidebar_label: "pinSnapshotData()"
beta: false
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

# pinSnapshotData()

此操作会固定快照数据，以防止其被垃圾回收。使用此操作可确保快照保持可用以用于恢复。

```javascript
await milvusClient.pinSnapshotData(data: PinSnapshotDataReq)
```

## 请求语法\{#request-syntax}

```javascript
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

<NextChannel action="exclude">

- **collection_name** (*string*) -
**[必需]**
快照所属 Collection 的名称。

- **snapshot_name** (*string*) -
**[必需]**
要固定的快照的名称。

- **ttl_seconds** (*number | string*) -
可选的固定 TTL，单位为秒。如果未指定，快照将被无限期固定。

- **db_name** (*string*) -
Database 的名称。可选。

- **timeout** (*number*) -
可选，允许 RPC 的时长，单位为毫秒。如果将其设置为 undefined，客户端会持续等待，直到服务器响应或发生错误。该值默认为 undefined。

- **client_request_id** (*string*) -
用于请求跟踪的跟踪 ID。可选。

</NextChannel>

<NextChannel action="include">

- **collection_name** (*string*) -
**[必需]**
快照所属 Collection 的名称。

- **snapshot_name** (*string*) -
**[必需]**
要固定的快照的名称。

- **ttl_seconds** (*number | string*) -
可选的固定 TTL，单位为秒。如果未指定，快照将被无限期固定。

- **db_name** (*string*) -
Database 的名称。可选。

- **timeout** (*number*) -
可选，允许 RPC 的时长，单位为毫秒。如果将其设置为 undefined，客户端会持续等待，直到服务器响应或发生错误。该值默认为 undefined。

- **client_request_id** (*string*) -
用于请求跟踪以及日志或追踪关联的可选 ID，由调用方提供。SDK 会将其作为 `client-request-id` gRPC 元数据标头发送，绝不会自行生成。请为每个请求使用唯一值，例如 UUID。采用 OpenTelemetry trace-ID 形式的值（32 个小写十六进制字符）也会被客户端遥测用作 trace ID。

</NextChannel>

**返回：**

*Promise&lt;PinSnapshotDataResponse&gt;*

此方法返回一个 Promise，该 Promise 会解析为 **PinSnapshotDataResponse** 对象。

```javascript
{
    pin_id: string,
    status:  ResStatus
}
```

**参数：**

- **pin_id** (*string*) -
固定租约的标识符。将此值传递给 `unpinSnapshotData()`，以便在其 TTL 到期前释放固定。

- **ResStatus**
一个 **ResStatus** 对象。

    - **code** （*number*） -

        表示操作结果的代码。如果此操作成功，该值保持为 **0**。

    - **error_code** （*string* | *number*） -

        指示所发生错误的错误代码。如果此操作成功，该值保持为 **Success**。

    - **reason** （*string*） -

        指示所报告错误原因的说明。如果此操作成功，该值为空字符串。

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

const res = await client.pinSnapshotData({
    collection_name: 'my_collection',
    snapshot_name: 'snapshot_2024_01',
});
```

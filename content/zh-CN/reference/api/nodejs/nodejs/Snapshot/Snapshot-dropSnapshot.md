---
title: "dropSnapshot() | Node.js"
slug: /node/node/Snapshot-dropSnapshot
sidebar_label: "dropSnapshot()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会删除 Collection 的快照。 | Node.js"
type: docx
token: DgiOdVOuLoKWFPxzKyucGV8Tnfb
sidebar_position: 3
keywords: 
  - Milvus 向量 Database
  - Milvus Database
  - Milvus 向量 Database
  - Zilliz Cloud
  - Zilliz
  - Zilliz Cloud
  - 云
  - dropSnapshot()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# dropSnapshot()

此操作会删除 Collection 的快照。

```javascript
await milvusClient.dropSnapshot(data: DropSnapshotReq)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.dropSnapshot({
    collection_name: string,
    snapshot_name: string,
    db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**参数：**

<NextChannel action="exclude">

- **collection_name** (*string*) -
**[必需]**
快照所属的 Collection 的名称。

- **snapshot_name** (*string*) -
**[必需]**
要删除的快照的名称。

- **db_name** (*string*) -
Database 的名称。可选。

- **timeout** (*number*) -
允许 RPC 执行的可选时长，单位为毫秒。如果将其设置为 undefined，客户端会持续等待，直到服务器响应或发生错误。该值默认为 undefined。

- **client_request_id** (*string*) -
用于请求跟踪的追踪 ID。可选。

</NextChannel>

<NextChannel action="include">

- **collection_name** (*string*) -
**[必需]**
快照所属的 Collection 的名称。

- **snapshot_name** (*string*) -
**[必需]**
要删除的快照的名称。

- **db_name** (*string*) -
Database 的名称。可选。

- **timeout** (*number*) -
允许 RPC 执行的可选时长，单位为毫秒。如果将其设置为 undefined，客户端会持续等待，直到服务器响应或发生错误。该值默认为 undefined。

- **client_request_id** (*string*) -
由调用方提供的可选 ID，用于请求跟踪以及日志或追踪关联。SDK 会将其作为 `client-request-id` gRPC 元数据标头发送，且绝不会生成该 ID。请为每个请求使用唯一值，例如 UUID。采用 OpenTelemetry trace-ID 格式的值（32 个小写十六进制字符）也会被客户端遥测用作追踪 ID。

</NextChannel>

**返回：**

*Promise&lt;ResStatus&gt;*

此方法返回一个 Promise，该 Promise 会解析为 **ResStatus** 对象。

**异常：**

- **Error**

    当此操作过程中发生任何错误时，将引发此异常。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await client.dropSnapshot({
    collection_name: 'my_collection',
    snapshot_name: 'snapshot_2024_01',
});
```

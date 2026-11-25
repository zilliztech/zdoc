---
title: "unpinSnapshotData() | Node.js"
slug: /node/node/Snapshot-unpinSnapshotData
sidebar_label: "unpinSnapshotData()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会取消固定快照数据，使其在不再需要时可被垃圾回收。 | Node.js"
type: docx
token: IjXedJe6poxhmAx6hFpcpNyJnsb
sidebar_position: 9
keywords: 
  - vectordb
  - 多模态向量 Database 检索
  - 检索增强生成
  - 大语言模型
  - zilliz
  - zilliz cloud
  - cloud
  - unpinSnapshotData()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# unpinSnapshotData()

此操作会取消固定快照数据，使其在不再需要时可被垃圾回收。

```javascript
await milvusClient.unpinSnapshotData(data: UnpinSnapshotDataReq)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.unpinSnapshotData({
    pin_id: number | string,
    timeout?: number,
    client_request_id?: string,
})
```

**参数：**

<NextChannel action="exclude">

- **pin_id** (*number | string*) -
**[必需]**
由 pinSnapshotData() 返回的 pin ID。

- **timeout** (*number*) -
允许 RPC 执行的可选时长，单位为毫秒。如果将其设置为 undefined，客户端会持续等待，直到服务器响应或发生错误。该值默认为 undefined。

- **client_request_id** (*string*) -
用于跟踪请求的 trace ID。可选。

</NextChannel>

<NextChannel action="include">

- **pin_id** (*number | string*) -
**[必需]**
由 pinSnapshotData() 返回的 pin ID。

- **timeout** (*number*) -
允许 RPC 执行的可选时长，单位为毫秒。如果将其设置为 undefined，客户端会持续等待，直到服务器响应或发生错误。该值默认为 undefined。

- **client_request_id** (*string*) -
一个可选的、由调用方提供的 ID，用于跟踪请求以及关联日志或 trace。SDK 会将其作为 `client-request-id` gRPC 元数据标头发送，且绝不会自行生成该 ID。请为每个请求使用唯一值，例如 UUID。OpenTelemetry trace-ID 格式（32 个小写十六进制字符）的值也会被客户端遥测用作 trace ID。

</NextChannel>

**返回：**

*Promise&lt;ResStatus&gt;*

此方法返回一个 promise，其解析结果为 **ResStatus** 对象。

**异常：**

- **错误**

    在此操作期间发生任何错误时，都会引发此异常。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await client.unpinSnapshotData({
    pin_id: 'pin_12345',
});
```

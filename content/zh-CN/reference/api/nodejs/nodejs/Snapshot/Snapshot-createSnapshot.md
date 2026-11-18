---
title: "createSnapshot() | Node.js"
slug: /node/node/Snapshot-createSnapshot
sidebar_label: "createSnapshot()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会为 Collection 创建快照。快照会捕获 Collection 及其数据的当前状态。 | Node.js"
type: docx
token: NeUFdr0OXo90RExodnccqc3OnYU
sidebar_position: 1
keywords: 
  - 语义搜索
  - 异常检测
  - 句子转换器
  - 推荐系统
  - zilliz
  - zilliz cloud
  - 云
  - createSnapshot()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# createSnapshot()

此操作会为 Collection 创建快照。快照会捕获 Collection 及其数据的当前状态。

```javascript
await milvusClient.createSnapshot(data: CreateSnapshotReq)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.createSnapshot({
    collection_name: string,
    snapshot_name: string,
    description?: string,
    compaction_protection_seconds?: number | string,
    db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**参数：**

- **collection_name** （*string*） -
**[必需]**
要创建快照的 Collection 的名称。

- **snapshot_name** （*string*） -
**[必需]**
快照的名称。

- **description** （*string*） -
快照的可选描述。

- **compaction_protection_seconds** （*number | string*） -
用于保护所引用的 Segment 免受 Compaction 影响的时长。可选。

- **db_name** （*string*） -
Database 的名称。可选。

- **timeout** （*number*） -
允许 RPC 执行的可选时长，单位为毫秒。如果将其设置为 undefined，客户端会持续等待，直到服务器响应或发生错误。该值默认为 undefined。

- **client_request_id** （*string*） -
用于请求跟踪的追踪 ID。可选。

**返回：**

*Promise&lt;ResStatus&gt;*

此方法返回一个 Promise，该 Promise 会解析为 **ResStatus** 对象。

**异常：**

- **Error**

    如果此操作期间发生任何错误，将引发此异常。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await client.createSnapshot({
    collection_name: 'my_collection',
    snapshot_name: 'snapshot_2024_01',
    description: 'Monthly backup',
});
```

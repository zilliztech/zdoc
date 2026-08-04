---
title: "createSnapshot() | Node.js"
slug: /node/node/Snapshot-createSnapshot
sidebar_label: "createSnapshot()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作为集合创建快照。快照会捕获集合及其数据的当前状态。 | Node.js"
type: docx
token: NeUFdr0OXo90RExodnccqc3OnYU
sidebar_position: 1
keywords: 
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
  - zilliz
  - zilliz cloud
  - cloud
  - createSnapshot()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# createSnapshot()

此操作为集合创建快照。快照会捕获集合及其数据的当前状态。

```typescript
await milvusClient.createSnapshot(data: CreateSnapshotReq)
```

## 请求语法\{#request-syntax}

```typescript
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

- **collection_name** (*string*) -<br/>
  **[必填]**<br/>
  要创建快照的集合名称。

- **snapshot_name** (*string*) -<br/>
  **[必填]**<br/>
  快照名称。

- **description** (*string*) -<br/>
  可选的快照描述。

- **compaction_protection_seconds** (*number | string*) -<br/>
  保护被引用 segment 不被压缩的持续时间。可选。

- **db_name** (*string*) -<br/>
  数据库名称。可选。

- **timeout** (*number*) -<br/>
  允许 RPC 使用的可选时长，单位为毫秒。如果将其设置为 `undefined`，客户端将持续等待，直到服务器响应或发生错误。默认值为 `undefined`。

- **client_request_id** (*string*) -<br/>
  用于请求跟踪的追踪 ID。可选。

**返回：**

*Promise&lt;ResStatus&gt;*

**异常：**

- **MilvusError**

    当此操作过程中发生任何错误时，将引发此异常。

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

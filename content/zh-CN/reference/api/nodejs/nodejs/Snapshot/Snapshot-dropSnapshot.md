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
  - milvus 向量 Database
  - milvus 数据库
  - milvus 向量 db
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - 云
  - dropSnapshot()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# dropSnapshot()

此操作会删除 Collection 的快照。

```typescript
await milvusClient.dropSnapshot(data: DropSnapshotReq)
```

## 请求语法\{#request-syntax}

```typescript
await milvusClient.dropSnapshot({
    collection_name: string,
    snapshot_name: string,
    db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**参数：**

- **collection_name** (*string*) -<br/>
  **[REQUIRED]**<br/>
  快照所属 Collection 的名称。

- **snapshot_name** (*string*) -<br/>
  **[REQUIRED]**<br/>
  要删除的快照名称。

- **db_name** (*string*) -<br/>
  Database 的名称。可选。

- **timeout** (*number*) -<br/>
  允许 RPC 持续的可选时长，单位为毫秒。如果将其设置为 undefined，客户端将持续等待，直到服务器响应或发生错误。默认值为 undefined。

- **client_request_id** (*string*) -<br/>
  用于请求跟踪的追踪 ID。可选。

**返回：**

*Promise&lt;ResStatus&gt;*

**异常：**

- **MilvusError**

    当此操作期间发生任何错误时，将引发此异常。

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

---
title: "batchDescribeCollections() | Node.js"
slug: /node/node/Collections-batchDescribeCollections
sidebar_label: "batchDescribeCollections()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作在一次调用中检索多个集合的 schema 和元数据。 | Node.js"
type: docx
token: ByKKdHVcAojjyZxKK3PciOTVnQg
sidebar_position: 23
keywords: 
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - zilliz
  - zilliz cloud
  - cloud
  - batchDescribeCollections()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# batchDescribeCollections()

此操作在一次调用中检索多个集合的 schema 和元数据。

```typescript
await milvusClient.batchDescribeCollections(data: BatchDescribeCollectionReq)
```

## 请求语法\{#request-syntax}

```typescript
await milvusClient.batchDescribeCollections({
    collection_names: string[],
    db_name?: string,
    collectionIDs?: number[],
    timeout?: number,
    client_request_id?: string,
})
```

**参数：**

- **collection_names** (*string[]*) -<br/>
  **[必需]**<br/>
  要描述的集合名称。

- **db_name** (*string*) -<br/>
  数据库名称。可选。

- **collectionIDs** (*number[]*) -<br/>
  要描述的集合 ID。可选。

- **timeout** (*number*) -<br/>
  可选的 RPC 允许持续时间，单位为毫秒。如果设置为 undefined，客户端将持续等待，直到服务器响应或发生错误。默认值为 undefined。

- **client_request_id** (*string*) -<br/>
  用于请求跟踪的追踪 ID。可选。

**返回值** *Promise&lt;BatchDescribeCollectionResponse&gt;*

此方法返回一个 promise，该 promise 会解析为一个 **BatchDescribeCollectionResponse** 对象。

```typescript
{
    responses: DescribeCollectionResponse[],
    status:  ResStatus
}
```

**参数：**

- **responses** (*DescribeCollectionResponse[]*) -<br/>
  一个数组，包含每个请求集合的 schema 和元数据。数组项的顺序与输入的集合名称顺序一致。有关 **DescribeCollectionResponse** 字段的完整参考，请参见 `describeCollection()` 文档。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则始终为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误代码。如果此操作成功，则始终为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的说明。如果此操作成功，则始终为空字符串。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await client.batchDescribeCollections({
    collection_names: ['collection1', 'collection2'],
});
```

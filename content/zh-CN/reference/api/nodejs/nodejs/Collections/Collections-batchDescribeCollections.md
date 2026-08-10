---
title: "batchDescribeCollections() | Node.js"
slug: /node/node/Collections-batchDescribeCollections
sidebar_label: "batchDescribeCollections()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作通过一次调用检索多个 Collection 的 Schema 和元数据。 | Node.js"
type: docx
token: ByKKdHVcAojjyZxKK3PciOTVnQg
sidebar_position: 23
keywords: 
  - AI Agent
  - 语义搜索
  - 异常检测
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

此操作通过一次调用检索多个 Collection 的 Schema 和元数据。

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
  **[REQUIRED]**<br/>
  要描述的 Collection 名称。

- **db_name** (*string*) -<br/>
  Database 的名称。可选。

- **collectionIDs** (*number[]*) -<br/>
  要描述的 Collection ID。可选。

- **timeout** (*number*) -<br/>
  RPC 允许的可选时长，单位为毫秒。如果将其设置为 undefined，客户端会持续等待，直到服务器响应或发生错误。默认值为 undefined。

- **client_request_id** (*string*) -<br/>
  用于请求跟踪的追踪 ID。可选。

**返回** *Promise&lt;BatchDescribeCollectionResponse&gt;*

此方法返回一个 promise，解析为 **BatchDescribeCollectionResponse** 对象。

```typescript
{
    responses: DescribeCollectionResponse[],
    status:  ResStatus
}
```

**参数：**

- **responses** (*DescribeCollectionResponse[]*) -<br/>
  一个数组，包含每个请求的 Collection 的 Schema 和元数据。数组项的顺序与输入的 Collection 名称顺序相同。有关 **DescribeCollectionResponse** 的完整字段参考，请参阅 `describeCollection()` 文档。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则其值保持为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误代码。如果此操作成功，则其值保持为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的原因。如果此操作成功，则其值保持为空字符串。

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

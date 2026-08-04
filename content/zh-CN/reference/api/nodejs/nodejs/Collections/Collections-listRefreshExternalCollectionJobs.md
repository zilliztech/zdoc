---
title: "listRefreshExternalCollectionJobs() | Node.js"
slug: /node/node/Collections-listRefreshExternalCollectionJobs
sidebar_label: "listRefreshExternalCollectionJobs()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会列出外部集合的所有刷新任务。您可以按集合名称和数据库名称进行过滤。 | Node.js"
type: docx
token: AG5zdQCpXoy11MxWgD0ciYBRnJb
sidebar_position: 30
keywords: 
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - zilliz
  - zilliz cloud
  - cloud
  - listRefreshExternalCollectionJobs()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listRefreshExternalCollectionJobs()

此操作会列出外部集合的所有刷新任务。您可以按集合名称和数据库名称进行过滤。

```typescript
await milvusClient.listRefreshExternalCollectionJobs(data?: ListRefreshExternalCollectionJobsReq)
```

## 请求语法\{#request-syntax}

```typescript
await milvusClient.listRefreshExternalCollectionJobs({
    collection_name?: string,
    db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**参数：**

- **collection_name** (*string*) -<br/>
  可选，按集合名称过滤。

- **db_name** (*string*) -<br/>
  可选，按数据库名称过滤。

- **timeout** (*number*) -<br/>
  可选的 RPC 允许时长，单位为毫秒。如果设置为 undefined，客户端将持续等待，直到服务器响应或发生错误。默认值为 undefined。

- **client_request_id** (*string*) -<br/>
  用于请求跟踪的追踪 ID。可选。

**返回：** *Promise&lt;ListRefreshExternalCollectionJobsResponse&gt;*

此方法返回一个 Promise，该 Promise 会解析为一个 **ListRefreshExternalCollectionJobsResponse** 对象。

```typescript
{
    jobs: RefreshExternalCollectionJobInfo[],
    status:  ResStatus
}
```

**参数：**

- **jobs** (*RefreshExternalCollectionJobInfo[]*) -<br/>
  与所请求的数据库和集合过滤条件匹配的刷新任务列表。有关 **RefreshExternalCollectionJobInfo** 字段的完整参考，请参阅 `getRefreshExternalCollectionProgress()` 文档。

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

const res = await client.listRefreshExternalCollectionJobs({
    collection_name: 'my_external_collection',
});
```

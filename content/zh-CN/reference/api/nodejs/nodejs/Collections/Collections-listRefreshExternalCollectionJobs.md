---
title: "listRefreshExternalCollectionJobs() | Node.js"
slug: /node/node/Collections-listRefreshExternalCollectionJobs
sidebar_label: "listRefreshExternalCollectionJobs()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会列出外部 Collection 的所有刷新作业。您可以按 Collection 名称和 Database 名称进行筛选。 | Node.js"
type: docx
token: AG5zdQCpXoy11MxWgD0ciYBRnJb
sidebar_position: 30
keywords: 
  - AI Agent
  - 语义搜索
  - 异常检测
  - sentence transformers
  - zilliz
  - zilliz cloud
  - 云
  - listRefreshExternalCollectionJobs()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# listRefreshExternalCollectionJobs()

此操作会列出外部 Collection 的所有刷新作业。您可以按 Collection 名称和 Database 名称进行筛选。

```javascript
await milvusClient.listRefreshExternalCollectionJobs(data?: ListRefreshExternalCollectionJobsReq)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.listRefreshExternalCollectionJobs({
    collection_name?: string,
    db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**参数：**

- **collection_name** (*string*) -
按 Collection 名称筛选，此项为可选。

- **db_name** (*string*) -
按 Database 名称筛选，此项为可选。

- **timeout** (*number*) -
允许 RPC 执行的可选时长，单位为毫秒。如果将其设置为 undefined，客户端会一直等待，直到服务器响应或发生错误。该值默认为 undefined。

- **client_request_id** (*string*) -
用于请求跟踪的 Trace ID。此项为可选。

**返回：**

*Promise&lt;ListRefreshExternalCollectionJobsResponse&gt;*

此方法返回一个 promise，解析为 **ListRefreshExternalCollectionJobsResponse** 对象。

```javascript
{
    jobs: RefreshExternalCollectionJobInfo[],
    status:  ResStatus
}
```

**参数：**

- **jobs** (*[RefreshExternalCollectionJobInfo](./Collections-RefreshExternalCollectionJobInfo)[]*) -

与所请求的 Database 和 Collection 筛选条件匹配的刷新作业列表。有关 [RefreshExternalCollectionJobInfo](./Collections-RefreshExternalCollectionJobInfo) 字段的完整参考，请参阅 `getRefreshExternalCollectionProgress()` 文档。

- **ResStatus**
一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则该值始终为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误码。如果此操作成功，则该值始终为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的说明。如果此操作成功，则该值始终为空字符串。


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

const res = await client.listRefreshExternalCollectionJobs({
    collection_name: 'my_external_collection',
});
```

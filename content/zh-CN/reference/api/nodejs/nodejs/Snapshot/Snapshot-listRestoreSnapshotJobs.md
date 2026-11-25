---
title: "listRestoreSnapshotJobs() | Node.js"
slug: /node/node/Snapshot-listRestoreSnapshotJobs
sidebar_label: "listRestoreSnapshotJobs()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会列出所有快照恢复作业。您可以按目标 Collection 名称和 Database 名称进行筛选。 | Node.js"
type: docx
token: TIXDdW1BmoPA3FxX0ONczHFqnKf
sidebar_position: 5
keywords: 
  - 检索增强生成
  - 大语言模型
  - 向量化
  - k 最近邻算法
  - zilliz
  - zilliz cloud
  - 云
  - listRestoreSnapshotJobs()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# listRestoreSnapshotJobs()

此操作会列出所有快照恢复作业。您可以按目标 Collection 名称和 Database 名称进行筛选。

```javascript
await milvusClient.listRestoreSnapshotJobs(data?: ListRestoreSnapshotJobsReq)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.listRestoreSnapshotJobs({
    collection_name?: string,
    db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**参数：**

<NextChannel action="exclude">

- **collection_name** (*string*) -
可选，按目标 Collection 名称进行筛选。

- **db_name** (*string*) -
可选，按 Database 名称进行筛选。

- **timeout** (*number*) -
允许 RPC 执行的可选时长，单位为毫秒。如果将此项设置为 undefined，则客户端会一直等待，直到服务器响应或发生错误。该值默认为 undefined。

- **client_request_id** (*string*) -
用于请求跟踪的 trace ID。可选。

</NextChannel>

<NextChannel action="include">

- **collection_name** (*string*) -
可选，按目标 Collection 名称进行筛选。

- **db_name** (*string*) -
可选，按 Database 名称进行筛选。

- **timeout** (*number*) -
允许 RPC 执行的可选时长，单位为毫秒。如果将此项设置为 undefined，则客户端会一直等待，直到服务器响应或发生错误。该值默认为 undefined。

- **client_request_id** (*string*) -
可选，由调用方提供的 ID，用于请求跟踪以及日志或追踪关联。SDK 会将其作为 `client-request-id` gRPC 元数据头发送，并且绝不会自动生成该 ID。请为每个请求使用唯一值，例如 UUID。采用 OpenTelemetry trace-ID 格式的值（32 个小写十六进制字符）也会被客户端遥测用作 trace ID。

</NextChannel>

**返回：**

*Promise&lt;ListRestoreSnapshotJobsResponse&gt;*

此方法返回一个 promise，该 promise 解析为 **ListRestoreSnapshotJobsResponse** 对象。

```javascript
{
    jobs: RestoreSnapshotJobInfo[],
    status:  ResStatus
}
```

**参数：**

- **jobs** (*[RestoreSnapshotJobInfo](./Snapshot-RestoreSnapshotJobInfo)[]*) -

与请求的 Database 和 Collection 筛选条件匹配的恢复作业列表。有关 [RestoreSnapshotJobInfo](./Snapshot-RestoreSnapshotJobInfo) 字段的完整参考，请参阅 `getRestoreSnapshotState()` 文档。

- **ResStatus**
一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则其值保持为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误代码。如果此操作成功，则其值保持为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的说明。如果此操作成功，则其值保持为空字符串。

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

const res = await client.listRestoreSnapshotJobs({
    collection_name: 'restored_collection',
});
```

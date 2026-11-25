---
title: "listSnapshots() | Node.js"
slug: /node/node/Snapshot-listSnapshots
sidebar_label: "listSnapshots()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会列出某个 Collection 的所有快照。 | Node.js"
type: docx
token: VjhTds7NPoyPjBxk4PNc5pe0nw6
sidebar_position: 6
keywords: 
  - AI 幻觉
  - AI Agent
  - 语义搜索
  - 异常检测
  - zilliz
  - zilliz cloud
  - 云
  - listSnapshots()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# listSnapshots()

此操作会列出某个 Collection 的所有快照。

```javascript
await milvusClient.listSnapshots(data: ListSnapshotsReq)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.listSnapshots({
    collection_name: string,
    db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**参数：**

<NextChannel action="exclude">

- **collection_name** (*string*) -
**[必需]**
Collection 的名称。

- **db_name** (*string*) -
Database 的名称。可选。

- **timeout** (*number*) -
允许 RPC 执行的可选时长，单位为毫秒。如果将其设置为 undefined，客户端会持续等待，直到服务器响应或发生错误。默认值为 undefined。

- **client_request_id** (*string*) -
用于请求跟踪的追踪 ID。可选。

</NextChannel>

<NextChannel action="include">

- **collection_name** (*string*) -
**[必需]**
Collection 的名称。

- **db_name** (*string*) -
Database 的名称。可选。

- **timeout** (*number*) -
允许 RPC 执行的可选时长，单位为毫秒。如果将其设置为 undefined，客户端会持续等待，直到服务器响应或发生错误。默认值为 undefined。

- **client_request_id** (*string*) -
由调用方提供的可选 ID，用于请求跟踪以及日志关联或追踪关联。SDK 会将其作为 `client-request-id` gRPC 元数据标头发送，且不会自行生成。请为每个请求使用唯一值，例如 UUID。采用 OpenTelemetry trace-ID 形式的值（32 个小写十六进制字符）也会被客户端遥测用作 trace ID。

</NextChannel>

**返回：**

*Promise&lt;ListSnapshotsResponse&gt;*

此方法会返回一个 promise，并解析为 **ListSnapshotsResponse** 对象。

<NextChannel action="exclude">

```javascript
{
    snapshots: string[],
    status:  ResStatus
}
```

</NextChannel>

<NextChannel action="include">

```javascript
{
    snapshots: string[],
    snapshot_summaries?: SnapshotSummary[],
    status:  ResStatus
}
```

</NextChannel>

**参数：**

<NextChannel action="exclude">

- **snapshots** (*string[]*) -
所请求 Collection 当前存在的快照名称列表。

- **ResStatus**
一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则其值为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误代码。如果此操作成功，则其值为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的说明。如果此操作成功，则其值为空字符串。

</NextChannel>

<NextChannel action="include">

- **snapshots** (*string[]*) -
所请求 Collection 当前存在的快照名称列表。

- **snapshot_summaries** (*SnapshotSummary[]*) -
可选。快照的摘要。每个条目包含以下成员：

    - **name** (*string*) -

        快照名称。

    - **create_ts** (*string*) -

        快照的创建时间戳。

    - **description** (*string*) -

        快照描述。

    - **create_utc_ts** (*string*) -

        快照的创建时间，以 Unix 毫秒为单位。

- **ResStatus**
一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则其值为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误代码。如果此操作成功，则其值为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的说明。如果此操作成功，则其值为空字符串。

</NextChannel>

**异常：**

- **Error**

    此操作过程中发生任何错误时，都会引发此异常。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await client.listSnapshots({
    collection_name: 'my_collection',
});
```

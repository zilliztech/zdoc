---
title: "refreshExternalCollection() | Node.js"
slug: /node/node/Collections-refreshExternalCollection
sidebar_label: "refreshExternalCollection()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会触发外部 Collection 的数据刷新。当外部数据源已更新且您希望 Milvus 重新加载数据时，请使用此操作。 | Node.js"
type: docx
token: JoiWdRIFcojRI4xVXnCclEoVnh2
sidebar_position: 31
keywords: 
  - 音频相似性搜索
  - 弹性向量 Database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - zilliz
  - zilliz cloud
  - 云
  - refreshExternalCollection()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# refreshExternalCollection()

此操作会触发外部 Collection 的数据刷新。当外部数据源已更新且您希望 Milvus 重新加载数据时，请使用此操作。

```javascript
await milvusClient.refreshExternalCollection(data: RefreshExternalCollectionReq)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.refreshExternalCollection({
    collection_name: string,
    external_source?: string,
    external_spec?: string,
    db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**参数：**

<NextChannel action="exclude">

- **collection_name** (*string*) -
**[必需]**
要刷新的外部 Collection 的名称。

- **external_source** (*string*) -
可选的新外部数据源路径。如果提供，则将从该新数据源刷新 Collection。

</NextChannel>

<NextChannel action="include">

- **collection_name** (*string*) -
**[必需]**
要刷新的外部 Collection 的名称。

- **external_source** (*string*) -
可选的新外部数据源路径。如果提供，则将从该新数据源刷新 Collection。请同时提供 `external_source` 和 `external_spec`，或同时省略两者；如果同时省略两者，刷新会复用已持久化的数据源和规范。

</NextChannel>

在 Zilliz Cloud 上，`external_source` 接受两种方案：`volume://<volume_name>/<path>` 和 `milvus://<instance_id>/<db_name>/<collection_name>`。对于 `volume://` 数据源，`external_source` 和 `external_spec` 必须同时提供或同时省略；如果同时省略，刷新会复用之前持久化的数据源配置，并且仍会同步最新数据。对于 `milvus://` 数据源，适用同样的规则——省略它会复用已持久化的数据源，并且刷新会在同步前重新为源集群创建快照。

<NextChannel action="exclude">

- **external_spec** (*string*) -
可选的新外部规范配置。如果提供，则 Collection 将使用此新规范。

</NextChannel>

<NextChannel action="include">

- **external_spec** (*string*) -
可选的新外部规范配置。如果提供，则 Collection 将使用此新规范。`format` 的可选值包括 `parquet`、`vortex`、`lance-table`、`iceberg-table` 和 `milvus-table`。对于 `milvus-table`，请将 `external_source` 设置为 Milvus 快照元数据 JSON 路径，例如 `s3://bucket/snapshots/{collection_id}/metadata/{snapshot_id}.json`。

</NextChannel>

在 Zilliz Cloud 上，对于 `milvus://` 数据源，`format` 必须为 `milvus-table`（或省略）；对于其他数据源，请提供包含匹配 `format` 的规范（`parquet`、`vortex`、`lance-table`、`iceberg-table`）。

<NextChannel action="exclude">

- **db_name** (*string*) -
Database 的名称。可选。

- **timeout** (*number*) -
允许 RPC 执行的可选时长，单位为毫秒。如果将其设置为 undefined，客户端会持续等待，直到服务器响应或发生错误。该值默认为 undefined。

- **client_request_id** (*string*) -
用于请求跟踪的 Trace ID。可选。

</NextChannel>

<NextChannel action="include">

- **db_name** (*string*) -
Database 的名称。可选。

- **timeout** (*number*) -
允许 RPC 执行的可选时长，单位为毫秒。如果将其设置为 undefined，客户端会持续等待，直到服务器响应或发生错误。该值默认为 undefined。

- **client_request_id** (*string*) -
可选的、由调用方提供的 ID，用于请求跟踪以及日志或 Trace 关联。SDK 会将其作为 `client-request-id` gRPC 元数据头发送，且绝不会自动生成该值。请为每个请求使用唯一值，例如 UUID。采用 OpenTelemetry trace-ID 形式的值（32 个小写十六进制字符）也会被客户端遥测用作 trace ID。

</NextChannel>

**返回：**

*Promise&lt;RefreshExternalCollectionResponse&gt;*

此方法返回一个 promise，解析为 **RefreshExternalCollectionResponse** 对象。

```javascript
{
    job_id: string,
    status:  ResStatus
}
```

**参数：**

- **job_id** (*string*) -
异步刷新作业的标识符。将此值传递给 `getRefreshExternalCollectionProgress()` 以轮询完成情况。

- **ResStatus**
一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，其值为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误代码。如果此操作成功，其值为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的说明。如果此操作成功，则为空字符串。

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

const res = await client.refreshExternalCollection({
    collection_name: 'my_external_collection',
    external_source: 's3://bucket/path',
});
```

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
sidebar_position: 35
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

import Admonition from '@theme/Admonition';


# refreshExternalCollection()

此操作会触发外部 Collection 的数据刷新。当外部数据源已更新且您希望 Milvus 重新加载数据时，请使用此操作。

```typescript
await milvusClient.refreshExternalCollection(data: RefreshExternalCollectionReq)
```

## 请求语法\{#request-syntax}

```typescript
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

- **collection_name** (*string*) -<br/>
  **[必需]**<br/>
  要刷新的外部 Collection 的名称。

- **external_source** (*string*) -<br/>
  可选的新外部源路径。如果提供此参数，将从此新源刷新 Collection。请同时提供 `external_source` 和 `external_spec`，或同时省略两者；如果两者均省略，则刷新会复用已持久化的源和规范。在 Zilliz Cloud 上，`external_source` 接受两种方案：`volume://<volume_name>/<path>` 和 `milvus://<instance_id>/<db_name>/<collection_name>`。对于 `volume://` URI，适用上述规则。对于 `milvus://` 源，您必须在每次刷新请求中传递 `external_source`；省略该参数会使 Collection 继续提供先前同步的数据。

- **external_spec** (*string*) -<br/>
  可选的新外部源规范配置。如果提供此参数，Collection 将使用此新规范。`format` 的可选值为 `parquet`、`vortex`、`lance-table` 和 `iceberg-table`。在 Zilliz Cloud 上，`milvus-table` 源与 `milvus://` 方案配合使用；对于 `milvus://` 源，可以省略 `format`，其默认值为 `milvus-table`。

- **db_name** (*string*) -<br/>
  Database 的名称。可选。

- **timeout** (*number*) -<br/>
  允许 RPC 执行的可选时长，单位为毫秒。如果将其设置为 undefined，客户端会持续等待，直到服务器响应或发生错误。默认值为 undefined。

- **client_request_id** (*string*) -<br/>
  用于请求跟踪的追踪 ID。可选。

**返回值** *Promise&lt;RefreshExternalCollectionResponse&gt;*

此方法返回一个 promise，解析为 **RefreshExternalCollectionResponse** 对象。

```typescript
{
    job_id: string,
    status:  ResStatus
}
```

**参数：**

- **job_id** (*string*) -<br/>
  异步刷新任务的标识符。将此值传递给 `getRefreshExternalCollectionProgress()` 以轮询完成状态。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，其值为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误代码。如果此操作成功，其值为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的说明。如果此操作成功，则为空字符串。

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

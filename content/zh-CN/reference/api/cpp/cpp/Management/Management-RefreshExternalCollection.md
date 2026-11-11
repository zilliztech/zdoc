---
title: "RefreshExternalCollection() | Cloud"
slug: /cpp/cpp/Management-RefreshExternalCollection
sidebar_label: "RefreshExternalCollection()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会启动外部 Collection 的刷新任务。在外部数据发生变化且 Collection 元数据需要刷新后使用。 | Cloud"
type: docx
token: BRFNded7LoGTfJxgz9kcq20Vnmg
sidebar_position: 25
keywords: 
  - 向量搜索
  - knn 算法
  - HNSW
  - 什么是非结构化数据
  - zilliz
  - zilliz cloud
  - 云
  - RefreshExternalCollection()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# RefreshExternalCollection()

此操作会启动外部 Collection 的刷新任务。在外部数据发生变化且 Collection 元数据需要刷新后使用。

```c++
Status RefreshExternalCollection(const RefreshExternalCollectionRequest& request, RefreshExternalCollectionResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = milvus::RefreshExternalCollectionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithExternalSource("s3")
    .WithExternalSpec({{"bucket", "milvus-data"}, {"path", "collections/book"}});
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称。如果为空，则应用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置要刷新的外部 Collection 名称。

- `WithExternalSource(const std::string& external_source)`

    设置外部源 URI。

    请同时提供 `external_source` 和 `external_spec`，或同时省略两者；当两者均省略时，刷新会复用已持久化的源和规范。

    在 Zilliz Cloud 上，`external_source` 接受两种方案：`volume://<volume_name>/<path>` 和 `milvus://<instance_id>/<db_name>/<collection_name>`。对于 `volume://` URI，适用上述规则。对于 `milvus://` 源，同样适用该规则——省略它时会复用已持久化的源，刷新仍会同步最新数据。

- `WithExternalSpec(const nlohmann::json& external_spec)`

    以 JSON 形式设置外部源规范，例如 `format`。`format` 的可选值为 `parquet`、`vortex`、`lance-table` 和 `iceberg-table`。

    在 Zilliz Cloud 上，`milvus-table` 源与 `milvus://` 方案配合使用；对于 `milvus://` 源，可以省略 `format`，其默认值为 `milvus-table`。

**返回：**

*Status*

**异常：**

- **std::exception**

    如果请求无法发送或响应无法解析，则可能引发此异常。

## 示例\{#example}

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::RefreshExternalCollectionRequest()
    .WithExternalSource("s3")
    .WithExternalSpec({{"bucket", "milvus-data"}, {"path", "collections/book"}});
milvus::RefreshExternalCollectionResponse response;
status = client->RefreshExternalCollection(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

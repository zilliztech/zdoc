---
title: "BatchDescribeCollections() | Cloud"
slug: /cpp/cpp/Collections-BatchDescribeCollections
sidebar_label: "BatchDescribeCollections()"
beta: false
added_since: v2.6.3
last_modified: false
deprecate_since: false
notebook: false
description: "此操作可批量获取 Collection 的 Schema 和配置元数据。当您需要一次性查看多个 Collection 时，使用该操作可以减少网络往返次数。 | Cloud"
type: docx
token: IpztddRkJo1o6JxKNWHcPjO8n8f
sidebar_position: 8
keywords: 
  - Vector embeddings
  - Vector store
  - open source vector database
  - Vector index
  - zilliz
  - zilliz cloud
  - cloud
  - BatchDescribeCollections()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# BatchDescribeCollections()

此操作可批量获取 Collection 的 Schema 和配置元数据。当您需要一次性查看多个 Collection 时，使用该操作可以减少网络往返次数。

```c++
Status BatchDescribeCollections(const BatchDescribeCollectionsRequest& request, BatchDescribeCollectionsResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = BatchDescribeCollectionsRequest()
    .WithDatabaseName(db_name)
    .AddCollectionName("collection_a")
    .AddCollectionName("collection_b");
```

### BatchDescribeCollectionsRequest\{#batchdescribecollectionsrequest}

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Collection 所在的 Database。

- `WithCollectionNames(std::vector<std::string>&& collection_names)`

    设置要查询的 Collection 名称完整列表。

- `AddCollectionName(const std::string& collection_name)`

    向请求列表中追加一个 Collection 名称。

- `WithCollectionIDs(std::vector<int64_t>&& collection_ids)`

    设置要查询的 Collection ID 完整列表。

- `AddCollectionID(int64_t collection_id)`

    向请求列表中追加一个 Collection ID。

**返回值：**

包含 *BatchDescribeCollectionsResponse* 的 *Status*

### BatchDescribeCollectionsResponse\{#batchdescribecollectionsresponse}

此类表示由 `BatchDescribeCollections()` 返回的批量 Collection 元数据。

```c++
const BatchDescribeCollectionsResponse& response = resp;
```

**方法：**

- `const std::vector<CollectionDesc>& Descs() const`

    获取服务端返回的 Collection 描述信息。

**异常：**

- **StatusCode**

    请检查 `status.Code()` 和 `status.Message()`，以排查 Database 无效、Collection 缺失或权限不足等问题。

## 示例\{#example}

```c++
#include <milvus/MilvusClientV2.h>
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::BatchDescribeCollectionsResponse response;
status = client->BatchDescribeCollections(
    milvus::BatchDescribeCollectionsRequest()
        .WithDatabaseName("default")
        .AddCollectionName("books")
        .AddCollectionName("movies"),
    response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
for (const auto& desc : response.Descs()) {
    std::cout << desc.CollectionName() << std::endl;
}
```

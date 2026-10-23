---
title: "ListQuerySegments() | Cloud"
slug: /cpp/cpp/Management-ListQuerySegments
sidebar_label: "ListQuerySegments()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作用于从查询节点获取已加载 Segment 的信息。 | Cloud"
type: docx
token: J946dq9upog3BoxXTaucrrqvn4g
sidebar_position: 17
keywords: 
  - 稀疏与稠密
  - 稠密向量
  - 分层可导航小世界
  - 稠密嵌入
  - zilliz
  - zilliz cloud
  - 云
  - ListQuerySegments()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ListQuerySegments()

此操作用于从查询节点获取已加载 Segment 的信息。

```c++
Status ListQuerySegments(const ListQuerySegmentsRequest& request, ListQuerySegmentsResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = ListQuerySegmentsRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(name);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称。如果该值为空，则使用默认 Database。

- `WithCollectionName(const std::string& name)`

    设置 Collection 名称。

**返回值：**

包含 *ListQuerySegmentsResponse* 的 *Status*

请检查 `status.IsOk()` 以确认成功。

响应中的 `Segments()` 列表包含 `QuerySegmentInfo` 值。`QuerySegmentInfo` 继承了 `SegmentInfo` 的 Segment 元数据方法，并且还提供已加载 Segment 的内存大小。

**SegmentInfo 方法：**

- `const std::string& CollectionName() const`

    返回 Collection 名称。

- `SegmentLevel Level() const`

    返回 Segment 级别。

- `int64_t StorageVersion() const`

    返回存储版本。

- `bool IsSorted() const`

    返回该 Segment 是否已排序。

**QuerySegmentInfo 方法：**

- `int64_t MemSize() const`

    返回查询 Segment 的内存大小。

**异常：**

- **StatusCode**

    请检查 `status.Code()` 和 `status.Message()` 以获取错误详情。

## 示例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::ListQuerySegmentsResponse response;
status = client->ListQuerySegments(
    milvus::ListQuerySegmentsRequest()
        .WithCollectionName("my_collection"),
    response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "Segment count: " << response.Segments().size() << std::endl;
```

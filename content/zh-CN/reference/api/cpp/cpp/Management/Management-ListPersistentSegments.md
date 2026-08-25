---
title: "ListPersistentSegments() | Cloud"
slug: /cpp/cpp/Management-ListPersistentSegments
sidebar_label: "ListPersistentSegments()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作用于从数据节点获取已持久化 Segment 的信息。 | Cloud"
type: docx
token: XhwtdeOEmoyc9YxuVpqck1ejnNe
sidebar_position: 14
keywords: 
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - lexical search
  - zilliz
  - zilliz cloud
  - cloud
  - ListPersistentSegments()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ListPersistentSegments()

此操作用于从数据节点获取已持久化 Segment 的信息。

```c++
Status ListPersistentSegments(const ListPersistentSegmentsRequest& request, ListPersistentSegmentsResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = ListPersistentSegmentsRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(name);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称。若未指定，则使用默认 Database。

- `WithCollectionName(const std::string& name)`

    设置 Collection 名称。

**返回值：**

包含 *ListPersistentSegmentsResponse* 的 *Status*

请检查 `status.IsOk()` 以确认操作是否成功。

响应中的 `Segments()` 列表包含多个 `SegmentInfo` 值。除 Segment ID、Collection ID、Partition ID、行数和状态外，每个 `SegmentInfo` 值还包含 Collection 名称、Segment 级别、存储版本及排序状态。

**SegmentLevel 取值：**

- `UNKNOWN = -1`

- `LEGACY = 0`

- `L0 = 1`

- `L1 = 2`

- `L2 = 3`

**SegmentInfo 方法：**

- `const std::string& CollectionName() const`

    返回 Collection 名称。

- `SegmentLevel Level() const`

    返回 Segment 级别。

- `int64_t StorageVersion() const`

    返回存储版本。

- `bool IsSorted() const`

    返回 Segment 是否已排序。

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

milvus::ListPersistentSegmentsResponse response;
status = client->ListPersistentSegments(
    milvus::ListPersistentSegmentsRequest()
        .WithCollectionName("my_collection"),
    response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "Segment count: " << response.Segments().size() << std::endl;
```

---
title: "CreateIndex() | Cloud"
slug: /cpp/cpp/Management-CreateIndex
sidebar_label: "CreateIndex()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作为向量字段或标量字段创建索引。 | Cloud"
type: docx
token: J7Yxdgw6moJca1xZCe7cLOIunve
sidebar_position: 3
keywords: 
  - nn search
  - llm eval
  - Sparse vs Dense
  - Dense vector
  - zilliz
  - zilliz cloud
  - cloud
  - CreateIndex()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# CreateIndex()

此操作为向量字段或标量字段创建索引。

```c++
Status CreateIndex(const CreateIndexRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = CreateIndexRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithIndexes(indexes)
    .WithSync(sync)
    .WithTimeoutMs(timeout_ms);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称。若未指定，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 名称。

- `WithIndexes(std::vector<IndexDesc>&& indexes)`

    设置待创建的索引。

- `AddIndex(IndexDesc&& index)`

    添加一个待创建的索引。

- `WithSync(bool sync)`

    设置是否以同步模式执行。默认值为 **True**。

    - **True**：操作将阻塞，直到索引创建完成后再返回。

    - **False**：操作立即返回。

- `WithTimeoutMs(int64_t timeout_ms)`

    设置超时时间（毫秒）。默认值为 60000 ms。该参数仅在同步模式下生效。

    若 `WaitFlushedMs` 设为 0，此操作会反复调用 `DescribeIndex()` 检查索引状态，直至索引构建完成。若 `WaitFlushedMs` 大于 0，则在超过指定时长后终止轮询并返回超时状态。

**返回值：**

*Status*

检查 `status.IsOk()` 以确认操作成功。

**异常：**

- **StatusCode**

    检查 `status.Code()` 和 `status.Message()` 获取错误详情。

## 示例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::IndexDesc index_vector("vector_field_name", "vector_index_name", milvus::IndexType::HNSW,
                               milvus::MetricType::L2);
index_vector.AddExtraParam("M", "32");
index_vector.AddExtraParam("efConstruction", "100");

status = client->CreateIndex(milvus::CreateIndexRequest()
                                 .WithCollectionName(collection_name)
                                 .WithSync(true)
                                 .AddIndex(std::move(index_vector)));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

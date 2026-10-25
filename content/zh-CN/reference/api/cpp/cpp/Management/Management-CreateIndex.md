---
title: "CreateIndex() | Cloud"
slug: /cpp/cpp/Management-CreateIndex
sidebar_label: "CreateIndex()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会在 Collection 的向量字段或标量字段上创建一个或多个索引。您可以在一次调用中指定多个索引，在同步模式下，调用会等待索引完全构建完成。 | Cloud"
type: docx
token: F2mid3PxKova16x44f8cyyIFnoe
sidebar_position: 3
keywords: 
  - nn 搜索
  - LLM 评估
  - 稀疏与稠密
  - 稠密向量
  - Zilliz
  - Zilliz Cloud
  - 云
  - CreateIndex()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# CreateIndex()

此操作会在 Collection 的向量字段或标量字段上创建一个或多个索引。您可以在一次调用中指定多个索引，在同步模式下，调用会等待索引完全构建完成。

```c++
Status CreateIndex(const CreateIndexRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = CreateIndexRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithIndexes(indexes)
    .AddIndex(index)
    .WithSync(sync)
    .WithTimeoutMs(timeout_ms);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 的名称。如果名称为空，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置要为其字段建立索引的 Collection 的名称。

- `WithIndexes(std::vector<IndexDesc>&& indexes)`

    设置要创建的索引。接受一个会被移入请求的 std::vector&lt;IndexDesc&gt; 右值。

- `AddIndex(IndexDesc&& index)`

    添加要创建的索引。接受一个会被移入请求的 IndexDesc 右值。

- `WithSync(bool sync)`

    设置客户端是否等待索引完全构建完成。默认为 true；如果为 false，则无论索引构建进度如何，调用都会立即返回。

- `WithTimeoutMs(int64_t timeout_ms)`

    设置等待索引构建的超时时间（以毫秒为单位）。默认为 60000 ms，仅在同步模式下生效。值为零时，会轮询 DescribeIndex()，直到索引完全构建完成；值为正数时，一旦经过该时间段，CreateIndex() 会返回超时状态。

**返回值：**

*Status*

返回一个 Status，指示索引是否已成功创建。

**错误处理：**

- **std::exception**

    当请求构造、传输或响应处理失败时抛出。请检查异常消息或返回的 Status，以获取失败详情。

## 示例\{#example}

在已连接的 MilvusClientV2 上调用 CreateIndex()，为向量字段构建 HNSW 索引，并等待其准备就绪。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::IndexDesc index("vector", "vector_idx", milvus::IndexType::HNSW, milvus::MetricType::L2);
index.AddExtraParam("M", "16");

status = client->CreateIndex(milvus::CreateIndexRequest()
                                 .WithCollectionName(collection_name)
                                 .WithSync(true)
                                 .AddIndex(std::move(index)));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

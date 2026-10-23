---
title: "DescribeIndex() | Cloud"
slug: /cpp/cpp/Management-DescribeIndex
sidebar_label: "DescribeIndex()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作可获取 Collection 上索引的说明，包括其参数。 | Cloud"
type: docx
token: WjEJdkVfTo20gWx0dWpcRy4Nnzh
sidebar_position: 4
keywords: 
  - 向量 Database 如何工作
  - 向量 Database 对比
  - OpenAI 向量 Database
  - 自然语言处理 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - DescribeIndex()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DescribeIndex()

此操作可获取 Collection 上索引的说明，包括其参数。

```c++
Status DescribeIndex(const DescribeIndexRequest& request, DescribeIndexResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = DescribeIndexRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFieldName(field_name)
    .WithIndexName(index_name)
    .WithTimestamp(ts);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称。如果将此参数留空，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 的名称。

- `WithFieldName(const std::string& field_name)`

    设置索引所属字段的名称。

- `WithIndexName(const std::string& index_name)`

    设置索引的名称。如果同时指定 field_name 和 index_name，则以索引名称为准。

- `WithTimestamp(int64_t ts)`

    设置时间戳，以便仅检查在此时间戳之前生成的 Segment。如果该值为零，则检查所有 Segment。

**返回：**

*Status*

返回一个 Status，指示操作是否成功。索引说明由作为 response 参数传入的 DescribeIndexResponse 对象承载，其中 Descs() 提供 IndexDesc 条目列表。

- **response** (*DescribeIndexResponse*) -

    - **Descs** (*const std::vector&lt;IndexDesc&gt;&*) -

        获取索引说明。

        - **FieldName** (*const std::string&*) -

            索引所属的字段名称。

        - **IndexName** (*const std::string&*) -

            索引名称。索引名称不能为空。

        - **IndexId** (*int64_t*) -

            索引 ID。

        - **MetricType** (*milvus::MetricType*) -

            度量类型。

        - **IndexType** (*milvus::IndexType*) -

            索引类型。

        - **ExtraParams** (*const std::unordered_map&lt;std::string, std::string>&*) -

            获取额外参数。注意：此方法在 v2.4 中重新定义，可能影响旧版客户端代码。

        - **StateCode** (*milvus::IndexStateCode*) -

            获取索引状态。

        - **FailReason** (*std::string*) -

            获取索引失败原因。

        - **IndexedRows** (*int64_t*) -

            获取已索引行数。请注意，已索引行数可能大于总行数，因为 Compaction 后某些 Segment 会被重新索引。

        - **TotalRows** (*int64_t*) -

            获取总行数。

        - **PendingRows** (*int64_t*) -

            获取待处理的未索引行数。

**错误处理：**

- **std::exception**

    当请求构建、传输或响应处理失败时抛出。请检查异常消息或返回的 Status 以获取失败详情。

## 示例\{#example}

在已连接的 MilvusClientV2 上调用 DescribeIndex()，以获取基于某个字段构建的索引的说明。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::DescribeIndexResponse response;
auto request = milvus::DescribeIndexRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithIndexName(index_name);
status = client->DescribeIndex(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
for (const auto& index_desc : response.Descs()) {
    std::cout << "IndexName: " << index_desc.IndexName() << std::endl;
    std::cout << "FieldName: " << index_desc.FieldName() << std::endl;
}
```

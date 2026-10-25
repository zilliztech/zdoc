---
title: "GetCollectionStats() | Cloud"
slug: /cpp/cpp/Collections-GetCollectionStats
sidebar_label: "GetCollectionStats()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会获取 Collection 的统计信息，例如行数。目前仅返回行数。 | Cloud"
type: docx
token: V2TUd3ZWJoiv4LxTUFfc8H3Nnrc
sidebar_position: 26
keywords: 
  - Serverless 向量 Database
  - 开源 Milvus
  - Milvus 如何工作
  - Zilliz 向量 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - GetCollectionStats()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# GetCollectionStats()

此操作会获取 Collection 的统计信息，例如行数。目前仅返回行数。

```c++
Status GetCollectionStats(const GetCollectionStatsRequest& request, GetCollectionStatsResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = GetCollectionStatsRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称。如果名称为空，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 的名称。

**返回值：**

*Status*

返回一个 Status，指示操作是否成功。Collection 的统计信息（目前为行数）包含在响应对象中。

- **response** (*GetCollectionStatsResponse*) -

    - **Stats** (*const CollectionStat&*) -

        获取 Collection 统计信息。

        - **RowCount** (*uint64_t*) -

            返回此 Collection 的行数。

        - **Name** (*const std::string&*) -

            获取 Collection 名称。

        - **Statistics** (*const std::unordered_map&lt;std::string, std::string>&*) -

            获取此 Collection 的原始 key/value 统计映射。

**异常：**

- **std::exception**

    当请求构建、传输或响应处理失败时抛出。请检查异常消息或返回的 Status，以了解失败详情。

## 示例\{#example}

在已连接的 MilvusClientV2 上调用 GetCollectionStats()，以获取 Collection 的统计信息，并从响应中读取行数。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::GetCollectionStatsRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name);
milvus::GetCollectionStatsResponse response;
status = client->GetCollectionStats(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "Row count: " << response.Stats().RowCount() << std::endl;
```

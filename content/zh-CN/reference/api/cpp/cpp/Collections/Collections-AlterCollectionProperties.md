---
title: "AlterCollectionProperties() | Cloud"
slug: /cpp/cpp/Collections-AlterCollectionProperties
sidebar_label: "AlterCollectionProperties()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会更改现有 Collection 的属性。 | Cloud"
type: docx
token: P8QFdIyQiojuy1xDQwecMgwRnHg
sidebar_position: 7
keywords: 
  - 音频相似性搜索
  - 弹性向量 Database
  - Pinecone 与 Milvus
  - Chroma 与 Milvus
  - Zilliz
  - Zilliz Cloud
  - 云
  - AlterCollectionProperties()
  - C++ v3.0
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# AlterCollectionProperties()

此操作会更改现有 Collection 的属性。

```c++
Status AlterCollectionProperties(const AlterCollectionPropertiesRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = AlterCollectionPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithProperties(properties)
    .AddProperty(key, property);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 的名称。如果留空，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置要更改的 Collection 的名称。

- `WithProperties(std::unordered_map<std::string, std::string>&& properties)`

    以 key/value 对形式设置要应用于 Collection 的属性。该请求通过右值引用取得此映射的所有权，因此请使用 std::move 传递它。

- `AddProperty(const std::string& key, const std::string& property)`

    向要应用于 Collection 的属性添加单个 key/value 对。

**返回类型：**

*Status*

返回一个 Status，指示 Collection 属性是否已成功更改。

**异常：**

- **std::exception**

    当请求构造、传输或响应处理失败时抛出。请检查异常消息或返回的 Status，以了解失败详情。

## 示例\{#example}

在已连接的 MilvusClientV2 上调用 AlterCollectionProperties()，以更改 Collection 的属性。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::AlterCollectionPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .AddProperty("mmap.enabled", "true");
status = client->AlterCollectionProperties(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

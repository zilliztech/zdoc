---
title: "DropCollectionProperties() | Cloud"
slug: /cpp/cpp/Collections-DropCollectionProperties
sidebar_label: "DropCollectionProperties()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会从现有 Collection 中移除指定属性。 | Cloud"
type: docx
token: BMdudw948onYFzxpJrYc2tlOn7g
sidebar_position: 23
keywords: 
  - 什么是语义搜索
  - 嵌入模型
  - 图像相似度搜索
  - 上下文窗口
  - zilliz
  - zilliz cloud
  - 云
  - DropCollectionProperties()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# DropCollectionProperties()

此操作会从现有 Collection 中移除指定属性。

```c++
Status DropCollectionProperties(const DropCollectionPropertiesRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = DropCollectionPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithPropertyKeys(keys)
    .AddPropertyKey(key);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称；如果为空，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置要从中移除属性的 Collection 的名称。

- `WithPropertyKeys(std::set<std::string>&& keys)`

    设置要从 Collection 中移除的属性键。该请求通过右值引用获取该集合的所有权，因此请使用 std::move 传入。

- `AddPropertyKey(const std::string& key)`

    向要从 Collection 中移除的属性键中添加单个属性键。

**返回：**

*Status*

返回一个 Status，指示 Collection 属性是否已成功移除。

**错误处理：**

- **std::exception**

    在请求构建、传输或响应处理失败时抛出。请检查异常消息或返回的 Status 以获取失败详情。

## 示例\{#example}

在已连接的 MilvusClientV2 上调用 DropCollectionProperties()，从 Collection 中移除指定属性。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

std::set<std::string> property_keys{"mmap.enabled"};

auto request = milvus::DropCollectionPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithPropertyKeys(std::move(property_keys));
status = client->DropCollectionProperties(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

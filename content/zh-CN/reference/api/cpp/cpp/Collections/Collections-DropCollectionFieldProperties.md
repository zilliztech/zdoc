---
title: "DropCollectionFieldProperties() | Cloud"
slug: /cpp/cpp/Collections-DropCollectionFieldProperties
sidebar_label: "DropCollectionFieldProperties()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会从现有 Collection 的字段中移除指定属性。 | Cloud"
type: docx
token: FCj5dkwVqo6Mlsxi6w9c3c9xnZb
sidebar_position: 21
keywords: 
  - Zilliz Database
  - 非结构化数据
  - 向量 Database
  - IVF
  - zilliz
  - Zilliz Cloud
  - 云
  - DropCollectionFieldProperties()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# DropCollectionFieldProperties()

此操作会从现有 Collection 的字段中移除指定属性。

```c++
Status DropCollectionFieldProperties(const DropCollectionFieldPropertiesRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = DropCollectionFieldPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFieldName(field_name)
    .WithPropertyKeys(keys)
    .AddPropertyKey(key);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称；如果为空，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置包含目标字段的 Collection 的名称。

- `WithFieldName(const std::string& field_name)`

    设置要移除其属性的字段的名称。

- `WithPropertyKeys(std::set<std::string>&& keys)`

    设置要从字段中移除的属性键。请求会通过右值引用取得该集合的所有权，因此请使用 std::move 传入。

- `AddPropertyKey(const std::string& key)`

    添加要从字段中移除的单个属性键。

**返回：**

*Status*

返回一个 Status，指示字段属性是否成功移除。

**异常处理：**

- **std::exception**

    当请求构建、传输或响应处理失败时抛出。请检查异常消息或返回的 Status，以获取失败详情。

## 示例\{#example}

在已连接的 MilvusClientV2 上调用 DropCollectionFieldProperties()，以移除某个字段的属性。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::DropCollectionFieldPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFieldName(field_name)
    .AddPropertyKey("mmap.enabled");
status = client->DropCollectionFieldProperties(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

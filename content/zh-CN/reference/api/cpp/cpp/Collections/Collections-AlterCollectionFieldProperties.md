---
title: "AlterCollectionFieldProperties() | Cloud"
slug: /cpp/cpp/Collections-AlterCollectionFieldProperties
sidebar_label: "AlterCollectionFieldProperties()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会更改现有 Collection 中指定字段的属性。 | Cloud"
type: docx
token: TgEBdtrFron6aCxAE37cqHd3nvc
sidebar_position: 5
keywords: 
  - 自然语言搜索
  - 相似性搜索
  - 多模态 RAG
  - LLM 幻觉
  - zilliz
  - zilliz cloud
  - 云
  - AlterCollectionFieldProperties()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# AlterCollectionFieldProperties()

此操作会更改现有 Collection 中指定字段的属性。

```c++
Status AlterCollectionFieldProperties(const AlterCollectionFieldPropertiesRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = AlterCollectionFieldPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFieldName(field_name)
    .WithProperties(properties)
    .AddProperty(key, property);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称；如果该值为空，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置包含要更改字段的 Collection 名称。

- `WithFieldName(const std::string& field_name)`

    设置要更改的字段名称。

- `WithProperties(std::unordered_map<std::string, std::string>&& properties)`

    以 key/value 对形式设置要应用于该字段的属性。该请求通过右值引用取得此映射的所有权，因此请使用 std::move 传递它。

- `AddProperty(const std::string& key, const std::string& property)`

    添加一个要应用于该字段的 key/value 属性对。

**返回类型：**

*Status*

返回一个 Status，指示字段属性是否已成功更改。

**异常：**

- **std::exception**

    当请求构造、传输或响应处理失败时抛出。请检查异常消息或返回的 Status，以了解失败详情。

## 示例\{#example}

在已连接的 MilvusClientV2 上调用 AlterCollectionFieldProperties()，以更改字段的属性。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::AlterCollectionFieldPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFieldName(field_name)
    .AddProperty("mmap.enabled", "true");
status = client->AlterCollectionFieldProperties(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

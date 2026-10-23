---
title: "AlterIndexProperties() | Cloud"
slug: /cpp/cpp/Management-AlterIndexProperties
sidebar_label: "AlterIndexProperties()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会更改索引的属性。 | Cloud"
type: docx
token: HeMDdOpeKoRdCZxxhEkcWpCunDf
sidebar_position: 1
keywords: 
  - 混合向量搜索
  - 视频去重
  - 视频相似度搜索
  - 向量检索
  - Zilliz
  - Zilliz Cloud
  - 云
  - AlterIndexProperties()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# AlterIndexProperties()

此操作会更改索引的属性。

```c++
Status AlterIndexProperties(const AlterIndexPropertiesRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = AlterIndexPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithIndexName(index_name)
    .WithProperties(properties)
    .AddProperty(key, property);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 的名称。如果该值为空，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置包含该索引的 Collection 的名称。

- `WithIndexName(const std::string& index_name)`

    设置索引的名称。目前，此 API 仅支持索引名称。

- `WithProperties(std::unordered_map<std::string, std::string>&& properties)`

    设置要在索引上更改的属性，并将给定的键值对 unordered_map 移动至请求中。

- `AddProperty(const std::string& key, const std::string& property)`

    向索引添加单个属性，以键值对形式指定。

**返回：**

*Status*

返回一个 Status，指示索引属性是否已成功更改。

**异常：**

- **std::exception**

    当请求构建、传输或响应处理失败时抛出。请检查异常消息或返回的 Status，以获取失败详情。

## 示例\{#example}

在已连接的 MilvusClientV2 上调用 AlterIndexProperties()，以更改索引属性，例如启用 mmap。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

std::unordered_map<std::string, std::string> properties{{"mmap.enabled", "true"}};
auto request = milvus::AlterIndexPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithIndexName(index_name)
    .WithProperties(std::move(properties));
status = client->AlterIndexProperties(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

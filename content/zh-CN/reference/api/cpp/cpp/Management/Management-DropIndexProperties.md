---
title: "DropIndexProperties() | Cloud"
slug: /cpp/cpp/Management-DropIndexProperties
sidebar_label: "DropIndexProperties()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会从索引中移除指定的属性。 | Cloud"
type: docx
token: P03PdoFAHoGTfxxA8AScr9CmnDc
sidebar_position: 6
keywords: 
  - DiskANN
  - 稀疏向量
  - 向量维度
  - ANN 搜索
  - zilliz
  - zilliz cloud
  - 云
  - DropIndexProperties()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropIndexProperties()

此操作会从索引中移除指定的属性。

```c++
Status DropIndexProperties(const DropIndexPropertiesRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = DropIndexPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithIndexName(index_name)
    .WithPropertyKeys(keys)
    .AddPropertyKey(key);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称。如果该值为空，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置包含该索引的 Collection 名称。

- `WithIndexName(const std::string& index_name)`

    设置要删除其属性的索引的名称。目前，此 API 仅支持 index_name。

- `WithPropertyKeys(std::set<std::string>&& keys)`

    设置要从索引中移除的属性键。接受以右值引用传递的 std::set&lt;std::string&gt;，因此其内容会被移动至请求中。

- `AddPropertyKey(const std::string& key)`

    向要从索引中移除的键集合中添加单个属性键。

**返回：**

*Status*

返回一个 Status，指示索引属性是否已成功删除。

**异常处理：**

- **std::exception**

    当请求构建、传输或响应处理失败时抛出。请检查异常消息或返回的 Status，以获取失败详情。

## 示例\{#example}

在已连接的 MilvusClientV2 上调用 DropIndexProperties()，以从索引中移除 mmap.enabled 属性。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::DropIndexPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithIndexName(index_name)
    .AddPropertyKey("mmap.enabled");
status = client->DropIndexProperties(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

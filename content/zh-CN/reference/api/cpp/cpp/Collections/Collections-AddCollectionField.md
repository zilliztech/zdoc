---
title: "AddCollectionField() | Cloud"
slug: /cpp/cpp/Collections-AddCollectionField
sidebar_label: "AddCollectionField()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会向现有 Collection 的 Schema 中添加一个新字段。 | Cloud"
type: docx
token: KMuzdtwSaoadnbx0caLcHCAGn1b
sidebar_position: 1
keywords: 
  - HNSW
  - 什么是非结构化数据
  - 向量嵌入
  - 向量存储
  - zilliz
  - zilliz cloud
  - cloud
  - AddCollectionField()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# AddCollectionField()

此操作会向现有 Collection 的 Schema 中添加一个新字段。

```c++
Status AddCollectionField(const AddCollectionFieldRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = AddCollectionFieldRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithField(field_schema);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称，若为空则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 名称。

- `WithField(FieldSchema&& field_schema)`

    设置要添加的字段的 Schema。该请求通过右值引用取得字段 Schema 的所有权，因此请使用 std::move 传递。

**返回值：**

*Status*

返回 Status，指示操作是否成功。

**错误处理：**

- **std::exception**

    当请求构造、传输或响应处理失败时抛出此异常。请检查异常消息或返回的 Status 以获取失败详情。

## 示例\{#example}

在已连接的 MilvusClientV2 上调用 AddCollectionField()，向现有 Collection 添加一个新字段。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::FieldSchema field_schema{"age", milvus::DataType::INT64};
field_schema.WithNullable(true);  // Nullable so rows can omit the value.

auto request = milvus::AddCollectionFieldRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithField(std::move(field_schema));
status = client->AddCollectionField(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

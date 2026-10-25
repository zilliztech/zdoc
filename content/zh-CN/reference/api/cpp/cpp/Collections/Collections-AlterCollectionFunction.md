---
title: "AlterCollectionFunction() | Cloud"
slug: /cpp/cpp/Collections-AlterCollectionFunction
sidebar_label: "AlterCollectionFunction()"
beta: false
added_since: v2.6.3
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会修改现有 Collection 的函数。Function 对象携带的函数名称用于确定要修改哪个函数。 | Cloud"
type: docx
token: YuvidafRvob4HuxnxrGcU7Vsnbh
sidebar_position: 6
keywords: 
  - 开源向量 Database
  - 开源向量 db
  - 向量 Database 示例
  - RAG 向量 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - AlterCollectionFunction()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# AlterCollectionFunction()

此操作会修改现有 Collection 的函数。Function 对象携带的函数名称用于确定要修改哪个函数。

```c++
Status AlterCollectionFunction(const AlterCollectionFunctionRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = AlterCollectionFunctionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFunction(function);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称；如果该名称为空，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 的名称。

- `WithFunction(const FunctionPtr& function)`

    设置包含新定义的函数；该参数为指向函数定义的共享指针，其名称用于确定要修改哪个函数。

**返回值：**

*Status*

返回一个 Status，指示函数是否已成功修改。

**错误处理：**

- **std::exception**

    当请求构造、传输或响应处理失败时抛出此异常。请检查异常消息或返回的 Status 以获取失败详情。

## 示例\{#example}

在已连接的 MilvusClientV2 上调用 AlterCollectionFunction()，以修改现有 Collection 的函数。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::AlterCollectionFunctionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFunction(function);
status = client->AlterCollectionFunction(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

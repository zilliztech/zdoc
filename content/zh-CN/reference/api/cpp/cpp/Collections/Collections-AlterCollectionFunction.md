---
title: "AlterCollectionFunction() | Cloud"
slug: /cpp/cpp/Collections-AlterCollectionFunction
sidebar_label: "AlterCollectionFunction()"
beta: false
added_since: v2.6.3
last_modified: false
deprecate_since: false
notebook: false
description: "此操作将根据提供的 Function 对象中的函数名称，替换现有 Collection 函数的定义。 | Cloud"
type: docx
token: YuvidafRvob4HuxnxrGcU7Vsnbh
sidebar_position: 6
keywords: 
  - vector database open source
  - open source vector db
  - vector database example
  - rag vector database
  - zilliz
  - zilliz cloud
  - cloud
  - AlterCollectionFunction()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# AlterCollectionFunction()

此操作将根据提供的 Function 对象中的函数名称，替换现有 Collection 函数的定义。

```c++
Status AlterCollectionFunction(const AlterCollectionFunctionRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = AlterCollectionFunctionRequest()
    .WithCollectionName(collection_name)
    .WithFunction(function_ptr);
```

### AlterCollectionFunctionRequest\{#altercollectionfunctionrequest}

**请求方法：**

- `WithCollectionName(const std::string& collection_name)`

    指定需要修改函数定义的 Collection。

- `WithDatabaseName(const std::string& db_name)`

    指定目标 Collection 所属的 Database。

- `WithFunction(const FunctionPtr& function)`

    提供更新后的函数定义。系统将根据函数名称确定要修改的目标函数。

**返回值：**

*Status*

**异常：**

- **StatusCode**

    请检查 `status.Code()` 和 `status.Message()`，以排查函数名称缺失、函数定义无效或 Collection 不可用等问题。

## 示例\{#example}

```c++
#include <milvus/MilvusClientV2.h>
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto function = std::make_shared<milvus::Function>();
function->SetName("bm25_fn");

status = client->AlterCollectionFunction(
    milvus::AlterCollectionFunctionRequest()
        .WithCollectionName("docs")
        .WithFunction(function));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

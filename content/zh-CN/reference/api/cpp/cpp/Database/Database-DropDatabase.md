---
title: "DropDatabase() | Cloud"
slug: /cpp/cpp/Database-DropDatabase
sidebar_label: "DropDatabase()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作删除所连接 Milvus 服务器上的 Database。 | Cloud"
type: docx
token: GkzpdbQMGovXFIx0n8pc6aDinfc
sidebar_position: 4
keywords: 
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - lexical search
  - zilliz
  - zilliz cloud
  - cloud
  - DropDatabase()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# DropDatabase()

此操作删除所连接 Milvus 服务器上的 Database。

```c++
Status DropDatabase(const DropDatabaseRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = DropDatabaseRequest()
    .WithDatabaseName(db_name);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置要删除的 Database 的名称。

**返回：**

*Status*

返回一个 Status，指示 Database 是否已成功删除。

**异常处理：**

- **std::exception**

    在请求构建、传输或响应处理失败时抛出。请检查异常消息或返回的 Status，以获取失败详情。

## 示例\{#example}

在已连接的 MilvusClientV2 上调用 DropDatabase()，按名称删除 Database。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::DropDatabaseRequest()
    .WithDatabaseName(db_name);
status = client->DropDatabase(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

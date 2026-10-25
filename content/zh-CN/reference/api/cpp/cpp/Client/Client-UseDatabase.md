---
title: "UseDatabase() | Cloud"
slug: /cpp/cpp/Client-UseDatabase
sidebar_label: "UseDatabase()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会将客户端的连接切换到同一 Milvus 服务器上的另一个 Database。 | Cloud"
type: docx
token: G70Odip3yoLDIwxaUGEc2e2Snoh
sidebar_position: 13
keywords: 
  - 神经网络
  - 深度学习
  - 知识库
  - 自然语言处理
  - Zilliz
  - Zilliz Cloud
  - 云
  - UseDatabase()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# UseDatabase()

此操作会将客户端的连接切换到同一 Milvus 服务器上的另一个 Database。

```c++
Status UseDatabase(const std::string& db_name)
```

**返回值：**

*Status*

返回一个 Status，指示操作是否成功。

**错误处理：**

- **std::exception**

    当客户端无法切换到目标 Database 时抛出。请检查异常消息或返回的 Status，以获取失败详情。

## 示例\{#example}

在已连接的 MilvusClientV2 上调用 UseDatabase()，将连接切换到另一个 Database。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->UseDatabase();
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

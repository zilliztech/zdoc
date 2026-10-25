---
title: "Connect() | Cloud"
slug: /cpp/cpp/Client-Connect
sidebar_label: "Connect()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作使用给定的连接参数建立客户端与 Milvus 服务器之间的连接。 | Cloud"
type: docx
token: TuY9d4LfuoEptYxb25HcXmqcncb
sidebar_position: 2
keywords: 
  - 混合搜索
  - 词法搜索
  - 最近邻搜索
  - Agentic RAG
  - Zilliz
  - Zilliz Cloud
  - 云
  - Connect()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# Connect()

此操作使用给定的连接参数建立客户端与 Milvus 服务器之间的连接。

```c++
Status Connect(const ConnectParam& connect_param)
```

**返回值：**

*Status*

返回一个 Status，指示连接是否成功建立。

**异常：**

- **std::exception**

    当请求构建、传输或响应处理失败时抛出。请检查异常消息或返回的 Status，以获取失败详情。

## 示例\{#example}

使用 URI 和 token 凭据连接到 Milvus 服务器，然后检查返回的状态。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

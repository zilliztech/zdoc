---
title: "CheckHealth() | Cloud"
slug: /cpp/cpp/Client-CheckHealth
sidebar_label: "CheckHealth()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作检查所连接的 Milvus 服务器的健康状态；响应会报告服务器是否健康，如果不健康，还会报告原因。 | Cloud"
type: docx
token: H8bEdNoDNoQMojxNEWKc7xIQnPb
sidebar_position: 1
keywords: 
  - 多模态 RAG
  - LLM 幻觉
  - 混合搜索
  - 词法搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - CheckHealth()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# CheckHealth()

此操作检查所连接的 Milvus 服务器的健康状态；响应会报告服务器是否健康，如果不健康，还会报告原因。

```c++
Status CheckHealth(const CheckHealthRequest& request, CheckHealthResponse& response)
```

**返回值：**

*Status*

返回一个表示操作是否成功的状态；响应会携带健康标志，如果不健康，还会携带原因。

- **response**（*CheckHealthResponse*） -

    - **IsHealthy**（*bool*） -

        获取 Milvus 服务器是否健康。

    - **Reasons**（*const std::vector&lt;std::string&gt;&*） -

        获取 Milvus 服务器不健康的原因。

    - **QuotaStates**（*const std::vector&lt;std::string&gt;&*） -

        获取导致 Milvus 服务器无法提供服务的配额状态。

**错误处理：**

- **std::exception**

    在请求构造、传输或响应处理失败时抛出。请检查异常消息或返回的 Status 以获取失败详情。

## 示例\{#example}

在已连接的 MilvusClientV2 上调用 CheckHealth()，以检查服务器的健康状态并报告任何失败原因。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::CheckHealthRequest request;
milvus::CheckHealthResponse response;
status = client->CheckHealth(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

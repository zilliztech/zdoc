---
title: "Create() | Cloud"
slug: /cpp/cpp/Client-Create
sidebar_label: "Create()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作创建一个新的 MilvusClientV2 实例。 | Cloud"
type: docx
token: CfaudoM2CocOHtxYirFcJqbKnof
sidebar_position: 4
keywords: 
  - knn
  - 图像搜索
  - LLMs
  - 机器学习
  - zilliz
  - zilliz cloud
  - 云
  - Create()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# Create()

此操作创建一个新的 MilvusClientV2 实例。

```c++
static std::shared_ptr<MilvusClientV2> Create()
```

**返回值：**

*std::shared_ptr&lt;milvus::MilvusClientV2&gt;*

返回新创建的客户端实例，该实例已准备好通过 Connect() 进行配置。

**错误处理：**

- **std::exception**

    当无法构造客户端实例时抛出。请检查异常消息以了解失败详情。

## 示例\{#example}

创建客户端实例，然后将其连接到 Milvus 服务器。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

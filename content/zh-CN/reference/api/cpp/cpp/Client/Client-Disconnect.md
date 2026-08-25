---
title: "Disconnect() | Cloud"
slug: /cpp/cpp/Client-Disconnect
sidebar_label: "Disconnect()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于关闭客户端与服务器之间的连接。 | Cloud"
type: docx
token: Wom0dLES1ojjtKxa8OdckAK3n1C
sidebar_position: 6
keywords: 
  - Zilliz
  - milvus vector database
  - milvus db
  - milvus vector db
  - zilliz
  - zilliz cloud
  - cloud
  - Disconnect()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# Disconnect()

此操作用于关闭客户端与服务器之间的连接。

```c++
Status Disconnect()
```

**返回值：**

*Status*

请检查 `status.IsOk()` 以确认操作成功。

**异常：**

- **StatusCode**

    请检查 `status.Code()` 和 `status.Message()` 以获取错误详情。

## 示例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

client->Disconnect();
```

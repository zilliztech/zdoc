---
title: "SetRpcDeadlineMs() | Cloud"
slug: /cpp/cpp/Client-SetRpcDeadlineMs
sidebar_label: "SetRpcDeadlineMs()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于修改每次 RPC 调用的超时时间（毫秒）。 | Cloud"
type: docx
token: Ff8gdJFLKoKfACxQXBxcK6mmnNf
sidebar_position: 12
keywords: 
  - AI 智能体
  - 语义搜索
  - 异常检测
  - 句子转换器
  - zilliz
  - zilliz cloud
  - cloud
  - SetRpcDeadlineMs()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# SetRpcDeadlineMs()

此操作用于修改每次 RPC 调用的超时时间（毫秒）。

```c++
Status SetRpcDeadlineMs(uint64_t timeout_ms)
```

**参数：**

- **timeout_ms** (*uint64_t*)

    设置超时时长（毫秒）。

**返回值：**

*Status*

检查 `status.IsOk()` 以确认操作成功。

**异常：**

- **StatusCode**

    检查 `status.Code()` 和 `status.Message()` 以获取错误详情。

## 示例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

// set timeout value for each rpc call
client->SetRpcDeadlineMs(1000);
```

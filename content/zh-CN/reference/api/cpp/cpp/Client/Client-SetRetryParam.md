---
title: "SetRetryParam() | Cloud"
slug: /cpp/cpp/Client-SetRetryParam
sidebar_label: "SetRetryParam()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于重置每次 RPC 调用的重试规则。 | Cloud"
type: docx
token: IR7hd6VQcoQPg3xNzL2cBw6Nn7f
sidebar_position: 10
keywords: 
  - 多模态向量 Database 检索
  - 检索增强生成
  - 大语言模型
  - 向量化
  - zilliz
  - zilliz cloud
  - cloud
  - SetRetryParam()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# SetRetryParam()

此操作用于重置每次 RPC 调用的重试规则。

```c++
Status SetRetryParam(const RetryParam& retry_param)
```

**参数：**

- **retry_param** (*const [RetryParam](./Client-RetryParam)&*)

    设置重试参数。

**返回值：**

*Status*

请检查 `status.IsOk()` 以确认操作是否成功。

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

milvus::RetryParam retry_param;
retry_param.WithMaxRetryTimes(10)
           .WithInitialBackOffMs(100)
           .WithMaxBackOffMs(5000)
           .WithBackOffMultiplier(2)
           .WithRetryOnRateLimit(true);

status = client->SetRetryParam(retry_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

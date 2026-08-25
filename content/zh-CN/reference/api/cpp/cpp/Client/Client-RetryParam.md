---
title: "RetryParam | Cloud"
slug: /cpp/cpp/Client-RetryParam
sidebar_label: "RetryParam"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此类用于保存传递给 `MilvusClient:SetRetryParam()` 的重试参数。对于限流响应等可重试的服务器错误，SDK 会根据这些参数自动重新发起 RPC 调用。网络错误和不可恢复的错误不会进行重试。 | Cloud"
type: docx
token: OxCLdTg9RoIzS0xwicjc8yJXnzc
sidebar_position: 9
keywords: 
  - 稀疏向量
  - 向量维度
  - ANN 搜索
  - 什么是向量嵌入
  - zilliz
  - zilliz cloud
  - cloud
  - RetryParam
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# RetryParam

此类用于保存传递给 `MilvusClient::SetRetryParam()` 的重试参数。对于限流响应等可重试的服务器错误，SDK 会根据这些参数自动重新发起 RPC 调用。网络错误和不可恢复的错误不会进行重试。

```c++
RetryParam param;
```

## 请求语法\{#request-syntax}

```c++
RetryParam param;
param.WithMaxRetryTimes(max_retry_times)
     .WithMaxRetryTimeoutMs(max_retry_timeout_ms)
     .WithInitialBackOffMs(initial_backoff_ms)
     .WithMaxBackOffMs(max_backoff_ms)
     .WithBackOffMultiplier(backoff_multiplier)
     .WithRetryOnRateLimit(retry_on_ratelimit);
```

**请求方法：**

- `WithMaxRetryTimes(uint64_t max_retry_times)`

    设置最大重试次数。默认值：`75`。

- `WithMaxRetryTimeoutMs(uint64_t max_retry_timeout_ms)`

    设置所有重试尝试的总超时时间（毫秒）。超过此限制后，无论 `WithMaxRetryTimes()` 的值如何，均不再重试。值为 `0` 表示不限制超时。默认值：`0`。

- `WithInitialBackOffMs(uint64_t initial_backoff_ms)`

    设置首次重试前的初始等待间隔（毫秒）。该值必须大于 `0`。默认值：`10`。

- `WithMaxBackOffMs(uint64_t max_backoff_ms)`

    设置重试间的最大等待间隔（毫秒）。退避时间随每次尝试按 `WithBackOffMultiplier()` 增长，但不会超过此上限值。该值必须大于 `0`。默认值：`3000`。

- `WithBackOffMultiplier(uint64_t backoff_multiplier)`

    设置每次重试后应用于当前退避间隔的乘数。例如，若乘数为 `3`，则每次后续尝试的等待时间将变为原来的三倍。该值必须大于 `0`。默认值：`3`。

- `WithRetryOnRateLimit(bool retry_on_ratelimit)`

    当 `true` 时，服务器返回的限流错误将触发重试。默认值：`true`。

## 示例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
#include <milvus/MilvusClientV2.h>
using namespace milvus;

auto client = MilvusClientV2::Create();
client->Connect(ConnectParam("YOUR_CLUSTER_ENDPOINT"));

RetryParam retryParam;
retryParam.WithMaxRetryTimes(10)
          .WithInitialBackOffMs(100)
          .WithMaxBackOffMs(5000)
          .WithBackOffMultiplier(2)
          .WithRetryOnRateLimit(true);

client->SetRetryParam(retryParam);
```

---
title: "RetryParam | Cloud"
slug: /cpp/cpp/Client-RetryParam
sidebar_label: "RetryParam"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此类保存传递给 `MilvusClient:SetRetryParam()` 的重试参数。对于可重试的服务器错误（例如速率限制响应），SDK 会根据这些参数自动重新发出 RPC 调用。网络错误和不可恢复的错误不会重试。 | Cloud"
type: docx
token: OxCLdTg9RoIzS0xwicjc8yJXnzc
sidebar_position: 10
keywords: 
  - 稀疏向量
  - 向量维度
  - ANN 搜索
  - 什么是向量嵌入
  - Zilliz
  - Zilliz Cloud
  - 云
  - RetryParam
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# RetryParam

此类保存传递给 `MilvusClient::SetRetryParam()` 的重试参数。对于可重试的服务器错误（例如速率限制响应），SDK 会根据这些参数自动重新发出 RPC 调用。网络错误和不可恢复的错误不会重试。

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

    设置最大重试次数。该值默认为 `75`。

- `WithMaxRetryTimeoutMs(uint64_t max_retry_timeout_ms)`

    设置所有重试尝试的总超时时间，单位为毫秒。一旦超过此限制，无论 `WithMaxRetryTimes()` 的值如何，都不会再进行重试。值为 `0` 表示不强制实施超时。该值默认为 `0`。

- `WithInitialBackOffMs(uint64_t initial_backoff_ms)`

    设置首次重试前以毫秒为单位的初始等待间隔。必须大于 `0`。该值默认为 `10`。

- `WithMaxBackOffMs(uint64_t max_backoff_ms)`

    设置重试之间以毫秒为单位的最大等待间隔。每次尝试时，退避时间都会按 `WithBackOffMultiplier()` 增长，但以该值为上限。必须大于 `0`。该值默认为 `3000`。

- `WithBackOffMultiplier(uint64_t backoff_multiplier)`

    设置每次重试后应用于当前退避间隔的乘数。例如，乘数为 `3` 时，后续每次尝试的等待时间都会增至三倍。必须大于 `0`。该值默认为 `3`。

- `WithRetryOnRateLimit(bool retry_on_ratelimit)`

    当为 `true` 时，服务器返回的速率限制错误会触发重试。该值默认为 `true`。

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

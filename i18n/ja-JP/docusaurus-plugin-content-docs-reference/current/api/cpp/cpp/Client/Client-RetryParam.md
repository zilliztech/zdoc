---
title: "RetryParam | Cloud"
slug: /cpp/cpp/Client-RetryParam
sidebar_label: "RetryParam"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "このクラスは、`MilvusClient:SetRetryParam()` に渡すリトライパラメータを保持します。レート制限応答など再試行可能なサーバーエラーが発生した場合、SDK はこれらのパラメータに従って RPC 呼び出しを自動的に再発行します。ネットワークエラーや回復不能なエラーは再試行されません。 | Cloud"
type: docx
token: OxCLdTg9RoIzS0xwicjc8yJXnzc
sidebar_position: 10
keywords: 
  - スパースベクトル
  - ベクトル次元
  - ANN 検索
  - ベクトル埋め込みとは
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

このクラスは、`MilvusClient::SetRetryParam()` に渡すリトライパラメータを保持します。レート制限応答など再試行可能なサーバーエラーが発生した場合、SDK はこれらのパラメータに従って RPC 呼び出しを自動的に再発行します。ネットワークエラーや回復不能なエラーは再試行されません。

```c++
RetryParam param;
```

## リクエスト構文\{#request-syntax}

```c++
RetryParam param;
param.WithMaxRetryTimes(max_retry_times)
     .WithMaxRetryTimeoutMs(max_retry_timeout_ms)
     .WithInitialBackOffMs(initial_backoff_ms)
     .WithMaxBackOffMs(max_backoff_ms)
     .WithBackOffMultiplier(backoff_multiplier)
     .WithRetryOnRateLimit(retry_on_ratelimit);
```

**リクエストメソッド：**

- `WithMaxRetryTimes(uint64_t max_retry_times)`

    最大リトライ回数を設定します。デフォルト：`75`。

- `WithMaxRetryTimeoutMs(uint64_t max_retry_timeout_ms)`

    すべてのリトライ試行にわたる合計タイムアウトをミリ秒単位で設定します。この制限を超えると、`WithMaxRetryTimes()` の値にかかわらず、それ以上再試行は行われません。`0` を指定すると、タイムアウトは適用されません。デフォルト：`0`。

- `WithInitialBackOffMs(uint64_t initial_backoff_ms)`

    最初のリトライ前の初期待機間隔をミリ秒単位で設定します。`0` より大きい値である必要があります。デフォルト：`10`。

- `WithMaxBackOffMs(uint64_t max_backoff_ms)`

    リトライ間の最大待機間隔をミリ秒単位で設定します。バックオフは試行ごとに `WithBackOffMultiplier()` の倍率で増加しますが、この値が上限になります。`0` より大きい値である必要があります。デフォルト：`3000`。

- `WithBackOffMultiplier(uint64_t backoff_multiplier)`

    各リトライ後に現在のバックオフ間隔へ適用する乗数を設定します。たとえば、乗数が `3` の場合、後続の各試行で待機時間が 3 倍になります。`0` より大きい値である必要があります。デフォルト：`3`。

- `WithRetryOnRateLimit(bool retry_on_ratelimit)`

    `true` の場合、サーバーからのレート制限エラーによって再試行が行われます。デフォルト：`true`。

## 例\{#example}

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

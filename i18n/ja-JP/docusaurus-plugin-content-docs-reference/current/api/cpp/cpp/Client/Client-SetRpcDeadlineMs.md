---
title: "SetRpcDeadlineMs() | Cloud"
slug: /cpp/cpp/Client-SetRpcDeadlineMs
sidebar_label: "SetRpcDeadlineMs()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、各 RPC 呼び出しのタイムアウト値をミリ秒単位で変更します。 | Cloud"
type: docx
token: Ff8gdJFLKoKfACxQXBxcK6mmnNf
sidebar_position: 11
keywords: 
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - zilliz
  - zilliz cloud
  - cloud
  - SetRpcDeadlineMs()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# SetRpcDeadlineMs()

この操作は、各 RPC 呼び出しのタイムアウト値をミリ秒単位で変更します。

```c++
Status SetRpcDeadlineMs(uint64_t timeout_ms)
```

**パラメータ:**

- **timeout_ms** (*uint64_t*)

    タイムアウト時間をミリ秒単位で設定します。

**戻り値:**

*Status*

`status.IsOk()` を参照して成功を確認します。

**例外:**

- **StatusCode**

    エラーの詳細については、`status.Code()` および `status.Message()` を確認してください。

## 例\{#example}

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

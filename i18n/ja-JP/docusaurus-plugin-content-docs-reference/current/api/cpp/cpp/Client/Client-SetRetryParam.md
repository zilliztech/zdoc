---
title: "SetRetryParam() | Cloud"
slug: /cpp/cpp/Client-SetRetryParam
sidebar_label: "SetRetryParam()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、各 RPC 呼び出しのリトライ ルールを再設定します。 | Cloud"
type: docx
token: IR7hd6VQcoQPg3xNzL2cBw6Nn7f
sidebar_position: 10
keywords: 
  - マルチモーダルベクトルデータベース検索
  - Retrieval Augmented Generation
  - 大規模言語モデル
  - ベクトル化
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

この操作は、各 RPC 呼び出しのリトライ ルールを再設定します。

```c++
Status SetRetryParam(const RetryParam& retry_param)
```

**パラメータ:**

- **retry_param** (*const [RetryParam](./Client-RetryParam)&*)

    リトライ パラメータを設定します。

**戻り値:**

*Status*

`status.IsOk()` を確認し、成功したかどうかを判断します。

**例外:**

- **StatusCode**

    エラーの詳細については、`status.Code()` および `status.Message()` を参照してください。

## 例\{#example}

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

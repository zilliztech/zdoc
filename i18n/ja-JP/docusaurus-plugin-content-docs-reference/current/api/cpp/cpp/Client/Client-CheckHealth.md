---
title: "CheckHealth() | Cloud"
slug: /cpp/cpp/Client-CheckHealth
sidebar_label: "CheckHealth()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、サーバーのヘルスステータスを確認します。 | Cloud"
type: docx
token: IJ7ydRsczoA4TAxrcqjc6guMnSb
sidebar_position: 1
keywords: 
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - lexical search
  - zilliz
  - zilliz cloud
  - cloud
  - CheckHealth()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# CheckHealth()

この操作は、サーバーのヘルスステータスを確認します。

```c++
Status CheckHealth(const CheckHealthRequest& request, CheckHealthResponse& response)
```

**戻り値:**

*CheckHealthResponse* を含む *Status*

成功したかどうかを確認するには、`status.IsOk()` を確認してください。

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

milvus::CheckHealthResponse resp_health;
status = client->CheckHealth(milvus::CheckHealthRequest(), resp_health);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
if (resp_health.IsHealthy()) {
    std::cout << "The milvus server is healthy" << std::endl;
}
```

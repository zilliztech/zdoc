---
title: "GetCompactionState() | Cloud"
slug: /cpp/cpp/Management-GetCompactionState
sidebar_label: "GetCompactionState()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、Compaction ジョブのステータスを取得します。 | Cloud"
type: docx
token: G7OGdOxABoDWKMxUZDncelbanEd
sidebar_position: 9
keywords: 
  - 動画類似検索
  - ベクトル検索
  - 音声類似検索
  - Elastic ベクトルデータベース
  - zilliz
  - zilliz cloud
  - cloud
  - GetCompactionState()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# GetCompactionState()

この操作は、Compaction ジョブのステータスを取得します。

```c++
Status GetCompactionState(const GetCompactionStateRequest& request, GetCompactionStateResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = GetCompactionStateRequest()
    .WithCompactionID(id);
```

**リクエストメソッド:**

- `WithCompactionID(int64_t id)`

    `Compact()` で返される Compaction ジョブ ID を設定します。

**戻り値:**

*GetCompactionStateResponse* を含む *Status*

`status.IsOk()` を確認し、成功したかどうかを判断します。

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

int64_t compaction_id = 12345;  // obtained from Compact()

milvus::GetCompactionStateResponse response;
status = client->GetCompactionState(
    milvus::GetCompactionStateRequest()
        .WithCompactionID(compaction_id),
    response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "State: " << static_cast<int>(response.State()) << std::endl;
```

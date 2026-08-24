---
title: "GetCompactionPlans() | Cloud"
slug: /cpp/cpp/Management-GetCompactionPlans
sidebar_label: "GetCompactionPlans()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、Compaction ジョブのプランを返します。 | Cloud"
type: docx
token: KNcxdijIVobIUxxL1b3cyyhknsg
sidebar_position: 8
keywords: 
  - openai ベクトル db
  - 自然言語処理データベース
  - 安価なベクトルデータベース
  - マネージドベクトルデータベース
  - zilliz
  - zilliz cloud
  - cloud
  - GetCompactionPlans()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# GetCompactionPlans()

この操作は、Compaction ジョブのプランを返します。

```c++
Status GetCompactionPlans(const GetCompactionPlansRequest& request, GetCompactionPlansResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = GetCompactionPlansRequest()
    .WithCompactionID(id);
```

**リクエストメソッド:**

- `WithCompactionID(int64_t id)`

    `Compact()` で返される Compaction ジョブ ID を設定します。

**戻り値:**

*Status* および *GetCompactionPlansResponse*

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

int64_t compaction_id = 12345;  // obtained from Compact()

milvus::GetCompactionPlansResponse response;
status = client->GetCompactionPlans(
    milvus::GetCompactionPlansRequest()
        .WithCompactionID(compaction_id),
    response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "Plan count: " << response.Plans().size() << std::endl;
```

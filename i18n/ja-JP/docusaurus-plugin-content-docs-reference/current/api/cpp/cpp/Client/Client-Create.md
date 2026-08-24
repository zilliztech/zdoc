---
title: "Create() | Cloud"
slug: /cpp/cpp/Client-Create
sidebar_label: "Create()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は MilvusClientV2 インスタンスを生成します。 | Cloud"
type: docx
token: J3Rqd884xoiTSTxl4YjcbtvunWf
sidebar_position: 4
keywords: 
  - knn
  - Image Search
  - LLMs
  - Machine Learning
  - zilliz
  - zilliz cloud
  - cloud
  - Create()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# Create()

この操作は MilvusClientV2 インスタンスを生成します。

```c++
static std::shared_ptr<MilvusClientV2> Create()
```

**戻り値:**

*Status*

`status.IsOk()` を確認し、処理の成否を判定します。

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
```

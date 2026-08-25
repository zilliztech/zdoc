---
title: "Create() | Cloud"
slug: /cpp/cpp/Client-Create
sidebar_label: "Create()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作创建一个 MilvusClientV2 实例。 | Cloud"
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

此操作创建一个 MilvusClientV2 实例。

```c++
static std::shared_ptr<MilvusClientV2> Create()
```

**返回值：**

*Status*

检查 `status.IsOk()` 以确认是否成功。

**异常：**

- **StatusCode**

    查看 `status.Code()` 和 `status.Message()` 获取错误详情。

## 示例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

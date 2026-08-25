---
title: "GetCompactionPlans() | Cloud"
slug: /cpp/cpp/Management-GetCompactionPlans
sidebar_label: "GetCompactionPlans()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回 Compaction 作业的计划。 | Cloud"
type: docx
token: KNcxdijIVobIUxxL1b3cyyhknsg
sidebar_position: 8
keywords: 
  - openai vector db
  - natural language processing database
  - cheap vector database
  - Managed vector database
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

此操作返回 Compaction 作业的计划。

```c++
Status GetCompactionPlans(const GetCompactionPlansRequest& request, GetCompactionPlansResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = GetCompactionPlansRequest()
    .WithCompactionID(id);
```

**请求方法：**

- `WithCompactionID(int64_t id)`

    设置由 `Compact()` 返回的 Compaction 作业 ID。

**返回值：**

包含 *GetCompactionPlansResponse* 的 *Status*

检查 `status.IsOk()` 以确认是否成功。

**异常：**

- **StatusCode**

    检查 `status.Code()` 和 `status.Message()` 以获取错误详情。

## 示例\{#example}

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

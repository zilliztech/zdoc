---
title: "GetCompactionState() | Cloud"
slug: /cpp/cpp/Management-GetCompactionState
sidebar_label: "GetCompactionState()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于获取 Compaction 作业的状态。 | Cloud"
type: docx
token: G7OGdOxABoDWKMxUZDncelbanEd
sidebar_position: 9
keywords: 
  - 视频相似性搜索
  - 向量检索
  - 音频相似性搜索
  - 弹性向量 Database
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

此操作用于获取 Compaction 作业的状态。

```c++
Status GetCompactionState(const GetCompactionStateRequest& request, GetCompactionStateResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = GetCompactionStateRequest()
    .WithCompactionID(id);
```

**请求方法：**

- `WithCompactionID(int64_t id)`

    设置由 `Compact()` 返回的 Compaction 作业 ID。

**返回值：**

包含 *GetCompactionStateResponse* 的 *Status*

检查 `status.IsOk()` 以确认操作是否成功。

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

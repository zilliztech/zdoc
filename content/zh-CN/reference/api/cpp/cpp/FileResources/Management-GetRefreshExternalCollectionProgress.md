---
title: "GetRefreshExternalCollectionProgress() | Cloud"
slug: /cpp/cpp/Management-GetRefreshExternalCollectionProgress
sidebar_label: "GetRefreshExternalCollectionProgress()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作可获取刷新外部 Collection 任务的进度。您可以使用它轮询任务完成状态并查看失败原因。 | Cloud"
type: docx
token: X9AodAxugobD0Yxt7S9c27z9nNg
sidebar_position: 2
keywords: 
  - Zilliz Cloud
  - what is milvus
  - milvus database
  - milvus lite
  - zilliz
  - zilliz cloud
  - cloud
  - GetRefreshExternalCollectionProgress()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# GetRefreshExternalCollectionProgress()

此操作可获取刷新外部 Collection 任务的进度。您可以使用它轮询任务完成状态并查看失败原因。

```c++
Status GetRefreshExternalCollectionProgress(const GetRefreshExternalCollectionProgressRequest& request, GetRefreshExternalCollectionProgressResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = milvus::GetRefreshExternalCollectionProgressRequest()
    .WithJobID(job_id);
```

**请求方法：**

- `WithJobID(int64_t job_id)`

    设置由 `RefreshExternalCollection()` 返回的刷新任务 ID。

**返回值：**

*Status*

**异常：**

- **std::exception**

    当请求无法发送或响应无法解析时，可能会抛出此异常。

## 示例\{#example}

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::GetRefreshExternalCollectionProgressRequest()
    .WithJobID(job_id);
milvus::GetRefreshExternalCollectionProgressResponse response;
status = client->GetRefreshExternalCollectionProgress(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

{/* category: File Resources; action: CREATE; addedSince: v3.0.x */}

---
title: "ListRefreshExternalCollectionJobs() | Cloud"
slug: /cpp/cpp/Management-ListRefreshExternalCollectionJobs
sidebar_label: "ListRefreshExternalCollectionJobs()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会列出外部 Collection 的刷新任务。可用于检查历史或正在进行中的外部 Collection 刷新活动。 | Cloud"
type: docx
token: M9b1dFp2ioszBwxqFKUcs6gYn2e
sidebar_position: 24
keywords: 
  - Milvus Database
  - Milvus 向量 Database
  - Zilliz Cloud
  - 什么是 Milvus
  - Zilliz
  - Zilliz Cloud
  - 云
  - ListRefreshExternalCollectionJobs()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# ListRefreshExternalCollectionJobs()

此操作会列出外部 Collection 的刷新任务。可用于检查历史或正在进行中的外部 Collection 刷新活动。

```c++
Status ListRefreshExternalCollectionJobs(const ListRefreshExternalCollectionJobsRequest& request, ListRefreshExternalCollectionJobsResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = milvus::ListRefreshExternalCollectionJobsRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称。如果为空，则应用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置要列出刷新任务的 Collection 名称。

**返回值：**

*Status*

**异常：**

- **std::exception**

    如果请求无法发送或响应无法解析，则可能引发此异常。

## 示例\{#example}

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::ListRefreshExternalCollectionJobsRequest();
milvus::ListRefreshExternalCollectionJobsResponse response;
status = client->ListRefreshExternalCollectionJobs(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

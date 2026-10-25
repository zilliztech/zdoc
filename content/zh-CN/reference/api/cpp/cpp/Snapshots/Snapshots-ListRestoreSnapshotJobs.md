---
title: "ListRestoreSnapshotJobs() | Cloud"
slug: /cpp/cpp/Snapshots-ListRestoreSnapshotJobs
sidebar_label: "ListRestoreSnapshotJobs()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会列出恢复快照作业。您可以使用它查看恢复历史记录和正在进行的恢复操作。 | Cloud"
type: docx
token: ObE8dlNmooAuRQxQnyEci9RInxH
sidebar_position: 5
keywords: 
  - Zilliz Cloud
  - 什么是 Milvus
  - Milvus Database
  - Milvus Lite
  - Zilliz
  - Zilliz Cloud
  - 云
  - ListRestoreSnapshotJobs()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# ListRestoreSnapshotJobs()

此操作会列出恢复快照作业。您可以使用它查看恢复历史记录和正在进行的恢复操作。

```c++
Status ListRestoreSnapshotJobs(const ListRestoreSnapshotJobsRequest& request, ListRestoreSnapshotJobsResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = milvus::ListRestoreSnapshotJobsRequest()
    .WithDatabaseName("default")
    .WithCollectionName("book_restored");
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置 Database 名称。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 名称。

**返回类型：**

*Status*

**异常：**

- **std::exception**

    如果请求无法发送或响应无法解析，可能会引发此异常。

## 示例\{#example}

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::ListRestoreSnapshotJobsRequest()
    .WithDatabaseName("default")
    .WithCollectionName("book_restored");
milvus::ListRestoreSnapshotJobsResponse response;
status = client->ListRestoreSnapshotJobs(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

{/* category: Snapshots; action: CREATE; addedSince: v3.0.x */}

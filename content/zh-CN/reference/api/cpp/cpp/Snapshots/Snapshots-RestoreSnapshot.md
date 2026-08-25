---
title: "RestoreSnapshot() | Cloud"
slug: /cpp/cpp/Snapshots-RestoreSnapshot
sidebar_label: "RestoreSnapshot()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作将快照恢复至目标 Collection。您可以使用该方法创建恢复后的 Collection，而不会覆盖源 Collection。 | Cloud"
type: docx
token: Ym8fdBWGqobHIhx9NkHcwpmonce
sidebar_position: 8
keywords: 
  - 音频相似性搜索
  - 弹性向量 Database
  - Pinecone 对比 Milvus
  - Chroma 对比 Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - RestoreSnapshot()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# RestoreSnapshot()

此操作将快照恢复至目标 Collection。您可以使用该方法创建恢复后的 Collection，而不会覆盖源 Collection。

```c++
Status RestoreSnapshot(const RestoreSnapshotRequest& request, RestoreSnapshotResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = milvus::RestoreSnapshotRequest()
    .WithSnapshotName("snapshot_20260617")
    .WithSourceDatabaseName("default")
    .WithSourceCollectionName("book")
    .WithTargetDatabaseName("default")
    .WithTargetCollectionName("book_restored");
```

**请求方法：**

- `WithSnapshotName(const std::string& snapshot_name)`

    设置要恢复的快照。

- `WithSourceDatabaseName(const std::string& db_name)`

    设置源 Database。

- `WithSourceCollectionName(const std::string& collection_name)`

    设置源 Collection。

- `WithTargetDatabaseName(const std::string& db_name)`

    设置目标 Database。

- `WithTargetCollectionName(const std::string& collection_name)`

    设置目标 Collection。

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

auto request = milvus::RestoreSnapshotRequest()
    .WithSnapshotName("snapshot_20260617")
    .WithSourceDatabaseName("default")
    .WithSourceCollectionName("book")
    .WithTargetDatabaseName("default")
    .WithTargetCollectionName("book_restored");
milvus::RestoreSnapshotResponse response;
status = client->RestoreSnapshot(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

{/* category: Snapshots; action: CREATE; addedSince: v3.0.x */}

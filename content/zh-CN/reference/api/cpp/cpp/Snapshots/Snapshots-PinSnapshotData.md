---
title: "PinSnapshotData() | Cloud"
slug: /cpp/cpp/Snapshots-PinSnapshotData
sidebar_label: "PinSnapshotData()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会在指定的存活时间窗口内固定快照数据。在恢复或外部复制工作流期间，您可以使用该操作确保快照数据持续可用。 | Cloud"
type: docx
token: Yblkdh1ynoi4Igxu4wac3Jdvn1g
sidebar_position: 7
keywords: 
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
  - information retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - PinSnapshotData()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# PinSnapshotData()

此操作会在指定的存活时间窗口内固定快照数据。在恢复或外部复制工作流期间，您可以使用该操作确保快照数据持续可用。

```c++
Status PinSnapshotData(const PinSnapshotDataRequest& request, PinSnapshotDataResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = milvus::PinSnapshotDataRequest()
    .WithDatabaseName("default")
    .WithCollectionName("book")
    .WithSnapshotName("snapshot_20260617")
    .WithTtlSeconds(86400);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置 Database 名称。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 名称。

- `WithSnapshotName(const std::string& snapshot_name)`

    设置快照名称。

- `WithTtlSeconds(int64_t ttl_seconds)`

    设置快照数据的固定保留时长。

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

auto request = milvus::PinSnapshotDataRequest()
    .WithDatabaseName("default")
    .WithCollectionName("book")
    .WithSnapshotName("snapshot_20260617")
    .WithTtlSeconds(86400);
milvus::PinSnapshotDataResponse response;
status = client->PinSnapshotData(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

{/* category: Snapshots; action: CREATE; addedSince: v3.0.x */}

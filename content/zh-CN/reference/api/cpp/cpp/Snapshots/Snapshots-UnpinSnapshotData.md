---
title: "UnpinSnapshotData() | Cloud"
slug: /cpp/cpp/Snapshots-UnpinSnapshotData
sidebar_label: "UnpinSnapshotData()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于取消固定快照数据。当已固定的数据在 TTL 到期前不再需要时，可使用该操作。 | Cloud"
type: docx
token: TfBadHlwqoakz4xzFOEchPpVnVd
sidebar_position: 9
keywords: 
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - zilliz
  - zilliz cloud
  - cloud
  - UnpinSnapshotData()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# UnpinSnapshotData()

此操作用于取消固定快照数据。当已固定的数据在 TTL 到期前不再需要时，可使用该操作。

```c++
Status UnpinSnapshotData(const UnpinSnapshotDataRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = milvus::UnpinSnapshotDataRequest()
    .WithDatabaseName("default")
    .WithCollectionName("book")
    .WithSnapshotName("snapshot_20260617");
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置 Database 名称。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 名称。

- `WithSnapshotName(const std::string& snapshot_name)`

    设置快照名称。

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

auto request = milvus::UnpinSnapshotDataRequest()
    .WithDatabaseName("default")
    .WithCollectionName("book")
    .WithSnapshotName("snapshot_20260617");
status = client->UnpinSnapshotData(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

{/* category: Snapshots; action: CREATE; addedSince: v3.0.x */}

---
title: "DescribeSnapshot() | Cloud"
slug: /cpp/cpp/Snapshots-DescribeSnapshot
sidebar_label: "DescribeSnapshot()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于描述快照。您可以在恢复或清理前使用它来查看快照元数据。 | Cloud"
type: docx
token: MjnKdyOXkoKD3exC7rUcXSCMnxe
sidebar_position: 2
keywords: 
  - 向量搜索
  - knn 算法
  - HNSW
  - 什么是非结构化数据
  - zilliz
  - zilliz cloud
  - cloud
  - DescribeSnapshot()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DescribeSnapshot()

此操作用于描述快照。您可以在恢复或清理前使用它来查看快照元数据。

```c++
Status DescribeSnapshot(const DescribeSnapshotRequest& request, DescribeSnapshotResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = milvus::DescribeSnapshotRequest()
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

auto request = milvus::DescribeSnapshotRequest()
    .WithDatabaseName("default")
    .WithCollectionName("book")
    .WithSnapshotName("snapshot_20260617");
milvus::DescribeSnapshotResponse response;
status = client->DescribeSnapshot(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

{/* category: Snapshots; action: CREATE; addedSince: v3.0.x */}

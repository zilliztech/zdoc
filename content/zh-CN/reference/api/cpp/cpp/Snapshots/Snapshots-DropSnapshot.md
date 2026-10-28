---
title: "DropSnapshot() | Cloud"
slug: /cpp/cpp/Snapshots-DropSnapshot
sidebar_label: "DropSnapshot()"
beta: ON REQUEST
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作删除快照。可使用此操作移除不再需要的快照。 | Cloud"
type: docx
token: M582dy1WyoYIbuxtun0cEc8ln3d
sidebar_position: 3
keywords: 
  - 稀疏与稠密
  - 稠密向量
  - 分层可导航小世界
  - 稠密嵌入
  - zilliz
  - zilliz cloud
  - 云
  - DropSnapshot()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# DropSnapshot()

此操作删除快照。可使用此操作移除不再需要的快照。

```c++
Status DropSnapshot(const DropSnapshotRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = milvus::DropSnapshotRequest()
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

    设置要删除的快照名称。

**返回值：**

*Status*

**异常：**

- **std::exception**

    如果请求无法发送或响应无法解析，可能会抛出此异常。

## 示例\{#example}

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::DropSnapshotRequest()
    .WithDatabaseName("default")
    .WithCollectionName("book")
    .WithSnapshotName("snapshot_20260617");
status = client->DropSnapshot(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

{/* category: Snapshots; action: CREATE; addedSince: v3.0.x */}

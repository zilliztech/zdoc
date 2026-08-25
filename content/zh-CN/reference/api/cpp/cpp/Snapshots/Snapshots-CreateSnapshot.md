---
title: "CreateSnapshot() | Cloud"
slug: /cpp/cpp/Snapshots-CreateSnapshot
sidebar_label: "CreateSnapshot()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作为 Collection 创建快照。建议在执行破坏性维护或恢复测试前调用。 | Cloud"
type: docx
token: S39Pd8SZ6oQ5dbxXS40cptWRnSf
sidebar_position: 1
keywords: 
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
  - information retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - CreateSnapshot()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# CreateSnapshot()

此操作为 Collection 创建快照。建议在执行破坏性维护或恢复测试前调用。

```c++
Status CreateSnapshot(const CreateSnapshotRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = milvus::CreateSnapshotRequest()
    .WithDatabaseName("default")
    .WithCollectionName("book")
    .WithDescription("before quarterly reindex")
    .WithCompactionProtectionSeconds(3600);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置包含目标 Collection 的 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置需要创建快照的 Collection。

- `WithDescription(const std::string& description)`

    设置可选的快照描述信息。

- `WithCompactionProtectionSeconds(int64_t seconds)`

    设置 Compaction 保留快照所需数据的时长。

**返回值：**

*Status*

**异常：**

- **std::exception**

    当请求无法发送或响应无法解析时，可能抛出此异常。

## 示例\{#example}

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::CreateSnapshotRequest()
    .WithDatabaseName("default")
    .WithCollectionName("book")
    .WithDescription("before quarterly reindex")
    .WithCompactionProtectionSeconds(3600);
status = client->CreateSnapshot(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

{/* category: Snapshots; action: CREATE; addedSince: v3.0.x */}

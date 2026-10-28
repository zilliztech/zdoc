---
title: "CreateSnapshot() | Cloud"
slug: /cpp/cpp/Snapshots-CreateSnapshot
sidebar_label: "CreateSnapshot()"
beta: ON REQUEST
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作为 Collection 创建快照。请在执行破坏性维护或恢复测试之前使用此操作。 | Cloud"
type: docx
token: S39Pd8SZ6oQ5dbxXS40cptWRnSf
sidebar_position: 1
keywords: 
  - 异常检测
  - sentence transformers
  - 推荐系统
  - 信息检索
  - zilliz
  - zilliz cloud
  - 云
  - CreateSnapshot()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# CreateSnapshot()

此操作为 Collection 创建快照。请在执行破坏性维护或进行恢复测试之前使用此操作。

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

    设置包含该 Collection 的 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置要创建快照的 Collection。

- `WithDescription(const std::string& description)`

    设置可选的快照描述。

- `WithCompactionProtectionSeconds(int64_t seconds)`

    设置 Compaction 保留快照所需数据的时长。

**返回：**

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

---
title: "GetRestoreSnapshotState() | Cloud"
slug: /cpp/cpp/Snapshots-GetRestoreSnapshotState
sidebar_label: "GetRestoreSnapshotState()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作获取恢复快照任务状态。可使用该操作轮询恢复进度和失败原因。 | Cloud"
type: docx
token: Utu5dQE8Eo1zD0xdoJccCAx0nnf
sidebar_position: 4
keywords: 
  - 视频搜索
  - AI 幻觉
  - AI 智能体
  - 语义搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - GetRestoreSnapshotState()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# GetRestoreSnapshotState()

此操作获取恢复快照任务状态。可使用该操作轮询恢复进度和失败原因。

```c++
Status GetRestoreSnapshotState(const GetRestoreSnapshotStateRequest& request, GetRestoreSnapshotStateResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = milvus::GetRestoreSnapshotStateRequest()
    .WithDatabaseName("default")
    .WithCollectionName("book_restored")
    .WithSnapshotName("snapshot_20260617")
    .WithJobID(job_id);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置 Database 名称。

- `WithCollectionName(const std::string& collection_name)`

    设置目标 Collection 名称。

- `WithSnapshotName(const std::string& snapshot_name)`

    设置快照名称。

- `WithJobID(int64_t job_id)`

    设置要轮询的恢复快照任务 ID。

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

auto request = milvus::GetRestoreSnapshotStateRequest()
    .WithDatabaseName("default")
    .WithCollectionName("book_restored")
    .WithSnapshotName("snapshot_20260617");
milvus::GetRestoreSnapshotStateResponse response;
status = client->GetRestoreSnapshotState(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

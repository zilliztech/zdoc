---
title: "GetRestoreSnapshotState() | Cloud"
slug: /cpp/cpp/Snapshots-GetRestoreSnapshotState
sidebar_label: "GetRestoreSnapshotState()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、スナップショットリストアジョブの状態を取得します。リストアの進行状況や失敗理由をポーリングする際に使用します。 | Cloud"
type: docx
token: Utu5dQE8Eo1zD0xdoJccCAx0nnf
sidebar_position: 4
keywords: 
  - Video search
  - AI Hallucination
  - AI Agent
  - semantic search
  - zilliz
  - zilliz cloud
  - cloud
  - GetRestoreSnapshotState()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# GetRestoreSnapshotState()

この操作は、スナップショットリストアジョブの状態を取得します。リストアの進行状況や失敗理由をポーリングする際に使用します。

```c++
Status GetRestoreSnapshotState(const GetRestoreSnapshotStateRequest& request, GetRestoreSnapshotStateResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = milvus::GetRestoreSnapshotStateRequest()
    .WithDatabaseName("default")
    .WithCollectionName("book_restored")
    .WithSnapshotName("snapshot_20260617");
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    データベース名を設定します。

- `WithCollectionName(const std::string& collection_name)`

    対象コレクション名を設定します。

- `WithSnapshotName(const std::string& snapshot_name)`

    スナップショット名を設定します。

**戻り値:**

*Status*

**例外:**

- **std::exception**

    リクエストの送信に失敗した場合、またはレスポンスの解析に失敗した場合に、この例外がスローされる可能性があります。

## 例\{#example}

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

{/* category: Snapshots; action: CREATE; addedSince: v3.0.x */}

---
title: "GetRestoreSnapshotState() | Cloud"
slug: /cpp/cpp/Snapshots-GetRestoreSnapshotState
sidebar_label: "GetRestoreSnapshotState()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、スナップショット復元ジョブの状態を取得します。復元の進行状況と失敗理由をポーリングする場合に使用します。 | Cloud"
type: docx
token: Utu5dQE8Eo1zD0xdoJccCAx0nnf
sidebar_position: 4
keywords: 
  - 動画検索
  - AI ハルシネーション
  - AI エージェント
  - セマンティック検索
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

この操作では、スナップショット復元ジョブの状態を取得します。復元の進行状況と失敗理由をポーリングする場合に使用します。

```c++
Status GetRestoreSnapshotState(const GetRestoreSnapshotStateRequest& request, GetRestoreSnapshotStateResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = milvus::GetRestoreSnapshotStateRequest()
    .WithDatabaseName("default")
    .WithCollectionName("book_restored")
    .WithSnapshotName("snapshot_20260617")
    .WithJobID(job_id);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    データベース名を設定します。

- `WithCollectionName(const std::string& collection_name)`

    対象のコレクション名を設定します。

- `WithSnapshotName(const std::string& snapshot_name)`

    スナップショット名を設定します。

- `WithJobID(int64_t job_id)`

    ポーリングするスナップショット復元ジョブの ID を設定します。

**戻り値:**

*Status*

**例外:**

- **std::exception**

    この例外は、リクエストを送信できない場合、またはレスポンスを解析できない場合に発生する可能性があります。

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

---
title: "RestoreSnapshot() | Cloud"
slug: /cpp/cpp/Snapshots-RestoreSnapshot
sidebar_label: "RestoreSnapshot()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、スナップショットをターゲットコレクションに復元します。ソースを上書きせずに、復元済みのコレクションを作成する際に使用します。 | Cloud"
type: docx
token: Ym8fdBWGqobHIhx9NkHcwpmonce
sidebar_position: 8
keywords: 
  - オーディオ類似検索
  - Elastic ベクトルデータベース
  - Pinecone vs Milvus
  - Chroma vs Milvus
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

この操作は、スナップショットをターゲットコレクションに復元します。ソースを上書きせずに、復元済みのコレクションを作成する際に使用します。

```c++
Status RestoreSnapshot(const RestoreSnapshotRequest& request, RestoreSnapshotResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = milvus::RestoreSnapshotRequest()
    .WithSnapshotName("snapshot_20260617")
    .WithSourceDatabaseName("default")
    .WithSourceCollectionName("book")
    .WithTargetDatabaseName("default")
    .WithTargetCollectionName("book_restored");
```

**リクエストメソッド:**

- `WithSnapshotName(const std::string& snapshot_name)`

    復元するスナップショットを設定します。

- `WithSourceDatabaseName(const std::string& db_name)`

    ソースデータベースを設定します。

- `WithSourceCollectionName(const std::string& collection_name)`

    ソースコレクションを設定します。

- `WithTargetDatabaseName(const std::string& db_name)`

    ターゲットデータベースを設定します。

- `WithTargetCollectionName(const std::string& collection_name)`

    ターゲットコレクションを設定します。

**戻り値:**

*Status*

**例外:**

- **std::exception**

    リクエストの送信に失敗した場合や、レスポンスを解析できない場合に、この例外が発生する可能性があります。

## 例\{#example}

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

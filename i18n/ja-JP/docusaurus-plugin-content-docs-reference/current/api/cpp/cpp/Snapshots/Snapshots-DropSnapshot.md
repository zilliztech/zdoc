---
title: "DropSnapshot() | Cloud"
slug: /cpp/cpp/Snapshots-DropSnapshot
sidebar_label: "DropSnapshot()"
beta: ON REQUEST
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はスナップショットを削除します。不要になったスナップショットを削除する場合に使用します。 | Cloud"
type: docx
token: M582dy1WyoYIbuxtun0cEc8ln3d
sidebar_position: 3
keywords: 
  - スパースとデンス
  - 密ベクトル
  - 階層型ナビゲート可能スモールワールド
  - 密な埋め込み
  - zilliz
  - zilliz cloud
  - cloud
  - DropSnapshot()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# DropSnapshot()

この操作はスナップショットを削除します。不要になったスナップショットを削除する場合に使用します。

```c++
Status DropSnapshot(const DropSnapshotRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = milvus::DropSnapshotRequest()
    .WithDatabaseName("default")
    .WithCollectionName("book")
    .WithSnapshotName("snapshot_20260617");
```

**リクエストメソッド：**

- `WithDatabaseName(const std::string& db_name)`

    データベース名を設定します。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

- `WithSnapshotName(const std::string& snapshot_name)`

    削除するスナップショット名を設定します。

**戻り値：**

*Status*

**例外：**

- **std::exception**

    リクエストを送信できない場合、またはレスポンスを解析できない場合に発生する可能性があります。

## 例\{#example}

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

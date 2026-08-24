---
title: "DescribeSnapshot() | Cloud"
slug: /cpp/cpp/Snapshots-DescribeSnapshot
sidebar_label: "DescribeSnapshot()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はスナップショットの情報を取得します。復元やクリーンアップの前に、スナップショットのメタデータを確認する際に使用します。 | Cloud"
type: docx
token: MjnKdyOXkoKD3exC7rUcXSCMnxe
sidebar_position: 2
keywords: 
  - ベクトル検索
  - knnアルゴリズム
  - HNSW
  - 非構造化データとは
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

この操作はスナップショットの情報を取得します。復元やクリーンアップの前に、スナップショットのメタデータを確認する際に使用します。

```c++
Status DescribeSnapshot(const DescribeSnapshotRequest& request, DescribeSnapshotResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = milvus::DescribeSnapshotRequest()
    .WithDatabaseName("default")
    .WithCollectionName("book")
    .WithSnapshotName("snapshot_20260617");
```

**リクエスト メソッド:**

- `WithDatabaseName(const std::string& db_name)`

    データベース名を指定します。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を指定します。

- `WithSnapshotName(const std::string& snapshot_name)`

    スナップショット名を指定します。

**戻り値:**

*Status*

**例外:**

- **std::exception**

    リクエストの送信に失敗した場合、またはレスポンスの解析に失敗した場合に、この例外が発生する可能性があります。

## 例\{#example}

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

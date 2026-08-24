---
title: "UnpinSnapshotData() | Cloud"
slug: /cpp/cpp/Snapshots-UnpinSnapshotData
sidebar_label: "UnpinSnapshotData()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はスナップショットデータのピンを解除します。TTL の期限切れ前にピン留めされたデータが不要になった場合に使用します。 | Cloud"
type: docx
token: TfBadHlwqoakz4xzFOEchPpVnVd
sidebar_position: 9
keywords: 
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - zilliz
  - zilliz cloud
  - cloud
  - UnpinSnapshotData()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# UnpinSnapshotData()

この操作はスナップショットデータのピンを解除します。TTL の期限切れ前にピン留めされたデータが不要になった場合に使用します。

```c++
Status UnpinSnapshotData(const UnpinSnapshotDataRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = milvus::UnpinSnapshotDataRequest()
    .WithDatabaseName("default")
    .WithCollectionName("book")
    .WithSnapshotName("snapshot_20260617");
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    データベース名を設定します。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

- `WithSnapshotName(const std::string& snapshot_name)`

    スナップショット名を設定します。

**戻り値:**

*Status*

**例外:**

- **std::exception**

    この例外は、リクエストの送信に失敗した場合やレスポンスの解析に失敗した場合にスローされる可能性があります。

## 例\{#example}

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::UnpinSnapshotDataRequest()
    .WithDatabaseName("default")
    .WithCollectionName("book")
    .WithSnapshotName("snapshot_20260617");
status = client->UnpinSnapshotData(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

{/* category: Snapshots; action: CREATE; addedSince: v3.0.x */}

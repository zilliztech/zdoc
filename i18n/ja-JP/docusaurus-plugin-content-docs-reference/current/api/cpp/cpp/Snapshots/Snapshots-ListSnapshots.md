---
title: "ListSnapshots() | Cloud"
slug: /cpp/cpp/Snapshots-ListSnapshots
sidebar_label: "ListSnapshots()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、コレクションのスナップショットを一覧表示します。利用可能な復元ポイントを確認するために使用します。 | Cloud"
type: docx
token: GJDKdgCbpoAxYkxpXygcdfFQnFe
sidebar_position: 6
keywords: 
  - knn
  - Image Search
  - LLMs
  - Machine Learning
  - zilliz
  - zilliz cloud
  - cloud
  - ListSnapshots()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ListSnapshots()

この操作は、コレクションのスナップショットを一覧表示します。利用可能な復元ポイントの確認に使用します。

```c++
Status ListSnapshots(const ListSnapshotsRequest& request, ListSnapshotsResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = milvus::ListSnapshotsRequest()
    .WithDatabaseName("default")
    .WithCollectionName("book");
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    データベース名を設定します。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

**戻り値:**

*Status*

**例外:**

- **std::exception**

    この例外は、リクエストの送信に失敗した場合やレスポンスを解析できない場合にスローされる可能性があります。

## 例\{#example}

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::ListSnapshotsRequest()
    .WithDatabaseName("default")
    .WithCollectionName("book");
milvus::ListSnapshotsResponse response;
status = client->ListSnapshots(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

{/* category: Snapshots; action: CREATE; addedSince: v3.0.x */}

---
title: "ListRestoreSnapshotJobs() | Cloud"
slug: /cpp/cpp/Snapshots-ListRestoreSnapshotJobs
sidebar_label: "ListRestoreSnapshotJobs()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、スナップショットのリストアジョブを一覧表示します。リストアの履歴や実行中のリストア操作を確認する際に使用します。 | Cloud"
type: docx
token: ObE8dlNmooAuRQxQnyEci9RInxH
sidebar_position: 5
keywords: 
  - Zilliz Cloud
  - what is milvus
  - milvus データベース
  - milvus lite
  - zilliz
  - zilliz cloud
  - cloud
  - ListRestoreSnapshotJobs()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ListRestoreSnapshotJobs()

この操作は、スナップショットのリストアジョブを一覧表示します。リストアの履歴や実行中のリストア操作を確認する際に使用します。

```c++
Status ListRestoreSnapshotJobs(const ListRestoreSnapshotJobsRequest& request, ListRestoreSnapshotJobsResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = milvus::ListRestoreSnapshotJobsRequest()
    .WithDatabaseName("default")
    .WithCollectionName("book_restored");
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

    リクエストの送信に失敗した場合、またはレスポンスを解析できない場合に、この例外が発生する可能性があります。

## 例\{#example}

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::ListRestoreSnapshotJobsRequest()
    .WithDatabaseName("default")
    .WithCollectionName("book_restored");
milvus::ListRestoreSnapshotJobsResponse response;
status = client->ListRestoreSnapshotJobs(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

{/* category: Snapshots; action: CREATE; addedSince: v3.0.x */}

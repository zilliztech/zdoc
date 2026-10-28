---
title: "CreateSnapshot() | Cloud"
slug: /cpp/cpp/Snapshots-CreateSnapshot
sidebar_label: "CreateSnapshot()"
beta: ON REQUEST
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、コレクションのスナップショットを作成します。破壊的なメンテナンスや復元テストの前に使用してください。 | Cloud"
type: docx
token: S39Pd8SZ6oQ5dbxXS40cptWRnSf
sidebar_position: 1
keywords: 
  - 異常検知
  - sentence transformers
  - レコメンダーシステム
  - 情報検索
  - zilliz
  - zilliz cloud
  - cloud
  - CreateSnapshot()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# CreateSnapshot()

この操作は、コレクションのスナップショットを作成します。破壊的なメンテナンスや復元テストの前に使用してください。

```c++
Status CreateSnapshot(const CreateSnapshotRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = milvus::CreateSnapshotRequest()
    .WithDatabaseName("default")
    .WithCollectionName("book")
    .WithDescription("before quarterly reindex")
    .WithCompactionProtectionSeconds(3600);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    コレクションを含むデータベースを設定します。

- `WithCollectionName(const std::string& collection_name)`

    スナップショットを作成するコレクションを設定します。

- `WithDescription(const std::string& description)`

    スナップショットの説明（任意）を設定します。

- `WithCompactionProtectionSeconds(int64_t seconds)`

    Compaction がスナップショットに必要なデータを保持する期間を設定します。

**戻り値:**

*Status*

**例外:**

- **std::exception**

    リクエストを送信できない場合、またはレスポンスを解析できない場合に、この例外が発生する可能性があります。

## 例\{#example}

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

---
title: "PinSnapshotData() | Cloud"
slug: /cpp/cpp/Snapshots-PinSnapshotData
sidebar_label: "PinSnapshotData()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定した有効期間（TTL）の間、スナップショットデータをピン留めします。復元や外部コピーのワークフロー中にスナップショットデータを利用可能な状態に保つために使用します。 | Cloud"
type: docx
token: Yblkdh1ynoi4Igxu4wac3Jdvn1g
sidebar_position: 7
keywords: 
  - 異常検知
  - sentence transformers
  - レコメンダーシステム
  - 情報検索
  - zilliz
  - zilliz cloud
  - cloud
  - PinSnapshotData()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# PinSnapshotData()

この操作は、指定した有効期間（TTL）の間、スナップショットデータをピン留めします。復元や外部コピーのワークフロー中にスナップショットデータを利用可能な状態に保つために使用します。

```c++
Status PinSnapshotData(const PinSnapshotDataRequest& request, PinSnapshotDataResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = milvus::PinSnapshotDataRequest()
    .WithDatabaseName("default")
    .WithCollectionName("book")
    .WithSnapshotName("snapshot_20260617")
    .WithTtlSeconds(86400);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    データベース名を設定します。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

- `WithSnapshotName(const std::string& snapshot_name)`

    スナップショット名を設定します。

- `WithTtlSeconds(int64_t ttl_seconds)`

    スナップショットデータのピン留め期間を設定します。

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

auto request = milvus::PinSnapshotDataRequest()
    .WithDatabaseName("default")
    .WithCollectionName("book")
    .WithSnapshotName("snapshot_20260617")
    .WithTtlSeconds(86400);
milvus::PinSnapshotDataResponse response;
status = client->PinSnapshotData(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

{/* category: Snapshots; action: CREATE; addedSince: v3.0.x */}

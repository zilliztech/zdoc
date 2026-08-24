---
title: "BatchDescribeCollections() | Cloud"
slug: /cpp/cpp/Collections-BatchDescribeCollections
sidebar_label: "BatchDescribeCollections()"
beta: false
added_since: v2.6.3
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、複数のコレクションのスキーマと設定メタデータをまとめて取得します。多数のコレクションを一度に確認する際にラウンドトリップを削減するために使用します。 | Cloud"
type: docx
token: IpztddRkJo1o6JxKNWHcPjO8n8f
sidebar_position: 8
keywords: 
  - ベクトル embeddings
  - ベクトル store
  - open source ベクトル データベース
  - ベクトル インデックス
  - zilliz
  - zilliz cloud
  - cloud
  - BatchDescribeCollections()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# BatchDescribeCollections()

この操作は、複数のコレクションのスキーマと設定メタデータをまとめて取得します。多数のコレクションを一度に確認する際にラウンドトリップを削減するために使用します。

```c++
Status BatchDescribeCollections(const BatchDescribeCollectionsRequest& request, BatchDescribeCollectionsResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = BatchDescribeCollectionsRequest()
    .WithDatabaseName(db_name)
    .AddCollectionName("collection_a")
    .AddCollectionName("collection_b");
```

### BatchDescribeCollectionsRequest\{#batchdescribecollectionsrequest}

**リクエスト メソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のコレクションが含まれるデータベースを設定します。

- `WithCollectionNames(std::ベクトル<std::string>&& collection_names)`

    情報を取得するコレクション名の完全なリストを設定します。

- `AddCollectionName(const std::string& collection_name)`

    リクエスト リストにコレクション名を1つ追加します。

- `WithCollectionIDs(std::ベクトル<int64_t>&& collection_ids)`

    情報を取得するコレクションIDの完全なリストを設定します。

- `AddCollectionID(int64_t collection_id)`

    リクエスト リストにコレクションIDを1つ追加します。

**戻り値:**

*Status* および *BatchDescribeCollectionsResponse*

### BatchDescribeCollectionsResponse\{#batchdescribecollectionsresponse}

このクラスは、`BatchDescribeCollections()` によって返されるコレクションの一括メタデータを表します。

```c++
const BatchDescribeCollectionsResponse& response = resp;
```

**メソッド:**

- `const std::ベクトル<CollectionDesc>& Descs() const`

    サーバーから返されたコレクションの詳細情報を取得します。

**例外:**

- **StatusCode**

    無効なデータベース、コレクションの欠落、または権限エラーが発生した場合は、`status.Code()` と `status.Message()` を確認してください。

## 例\{#example}

```c++
#include <milvus/MilvusClientV2.h>
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::BatchDescribeCollectionsResponse response;
status = client->BatchDescribeCollections(
    milvus::BatchDescribeCollectionsRequest()
        .WithDatabaseName("default")
        .AddCollectionName("books")
        .AddCollectionName("movies"),
    response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
for (const auto& desc : response.Descs()) {
    std::cout << desc.CollectionName() << std::endl;
}
```

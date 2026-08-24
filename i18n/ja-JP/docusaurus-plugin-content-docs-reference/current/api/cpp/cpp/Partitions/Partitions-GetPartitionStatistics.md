---
title: "GetPartitionStatistics() | Cloud"
slug: /cpp/cpp/Partitions-GetPartitionStatistics
sidebar_label: "GetPartitionStatistics()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "パーティションの統計情報を取得します。 | Cloud"
type: docx
token: LaPcdArhDo6aGnxpX8Oc5azCnCe
sidebar_position: 3
keywords: 
  - ベクトルデータベース オープンソース
  - オープンソース ベクトルDB
  - ベクトルデータベースの例
  - RAGベクトルデータベース
  - zilliz
  - zilliz cloud
  - cloud
  - GetPartitionStatistics()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# GetPartitionStatistics()

パーティションの統計情報を取得します。

```c++
Status GetPartitionStatistics(const GetPartitionStatsRequest& request, GetPartitionStatsResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = GetPartitionStatsRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithPartitionName(partition_name);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが適用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

- `WithPartitionName(const std::string& partition_name)`

    パーティション名を設定します。

**戻り値:**

*Status* および *GetPartitionStatsResponse*

`status.IsOk()` を確認して成功を判定します。現時点では、レスポンスに含まれるのは行数のみです。

**例外:**

- **StatusCode**

    エラーの詳細については、`status.Code()` および `status.Message()` を参照してください。

## 例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::GetPartitionStatsResponse response;
status = client->GetPartitionStatistics(
    milvus::GetPartitionStatsRequest()
        .WithCollectionName("my_collection")
        .WithPartitionName("my_partition"),
    response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "Row count: " << response.RowCount() << std::endl;
```

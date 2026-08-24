---
title: "ReleasePartitions() | Cloud"
slug: /cpp/cpp/Partitions-ReleasePartitions
sidebar_label: "ReleasePartitions()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、クエリノードから指定したパーティションのデータを解放します。 | Cloud"
type: docx
token: JJ28dtdEQo6J3Yx3HXkcnn7OnWh
sidebar_position: 7
keywords: 
  - 自然言語検索
  - 類似検索
  - マルチモーダルRAG
  - LLM幻覚
  - zilliz
  - zilliz cloud
  - cloud
  - ReleasePartitions()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ReleasePartitions()

この操作は、クエリノードから指定したパーティションのデータを解放します。

```c++
Status ReleasePartitions(const ReleasePartitionsRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = ReleasePartitionsRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithPartitionNames(partition_names);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが適用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

- `WithPartitionNames(const std::set<std::string>& partition_names)`

    パーティション名を設定します。

- `AddPartitionName(const std::string& partition_name)`

    ロード対象のパーティションを追加します。

**戻り値:**

*Status*

`status.IsOk()` を確認して、成功したかどうかを判断します。

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

status = client->ReleasePartitions(
    milvus::ReleasePartitionsRequest()
        .WithCollectionName("my_collection")
        .AddPartitionName("partition_1")
        .AddPartitionName("partition_2"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

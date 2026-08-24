---
title: "HasPartition() | Cloud"
slug: /cpp/cpp/Partitions-HasPartition
sidebar_label: "HasPartition()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "パーティションの存在を確認する操作です。 | Cloud"
type: docx
token: M7O7df6KLoqRS2x6ls0cuSwlnNh
sidebar_position: 4
keywords: 
  - ベクトル データベース open source
  - open source ベクトル db
  - ベクトル データベース example
  - rag ベクトル データベース
  - zilliz
  - zilliz cloud
  - cloud
  - HasPartition()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# HasPartition()

この操作は、パーティションが存在するかどうかを確認します。

```c++
Status HasPartition(const HasPartitionRequest& request, HasPartitionResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = HasPartitionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithPartitionName(partition_name);
```

**リクエスト メソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが使用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

- `WithPartitionName(const std::string& partition_name)`

    パーティション名を設定します。

**戻り値:**

*HasPartitionResponse* を含む *Status*

成功したかどうかは `status.IsOk()` で確認できます。

**例外:**

- **StatusCode**

    エラーの詳細は、`status.Code()` および `status.Message()` を参照してください。

## 例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::HasPartitionResponse response;
status = client->HasPartition(
    milvus::HasPartitionRequest()
        .WithCollectionName("my_collection")
        .WithPartitionName("my_partition"),
    response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "Partition exists: " << response.HasPartition() << std::endl;
```

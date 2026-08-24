---
title: "DropPartition() | Cloud"
slug: /cpp/cpp/Partitions-DropPartition
sidebar_label: "DropPartition()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、インデックスおよびセグメントを含めてパーティションを削除します。 | Cloud"
type: docx
token: SBLUdI6Wworo1oxrfAOcnH7jnFd
sidebar_position: 2
keywords: 
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - zilliz
  - zilliz cloud
  - cloud
  - DropPartition()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropPartition()

この操作は、インデックスおよびセグメントを含めてパーティションを削除します。

```c++
Status DropPartition(const DropPartitionRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = DropPartitionRequest()
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

status = client->DropPartition(
    milvus::DropPartitionRequest()
        .WithCollectionName(collection_name)
        .WithPartitionName(partition_name)
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

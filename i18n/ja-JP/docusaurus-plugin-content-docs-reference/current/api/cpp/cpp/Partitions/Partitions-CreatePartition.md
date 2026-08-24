---
title: "CreatePartition() | Cloud"
slug: /cpp/cpp/Partitions-CreatePartition
sidebar_label: "CreatePartition()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "コレクションにパーティションを作成します。 | Cloud"
type: docx
token: W65adsrWqolU5Lx7C5Oc19b2ne6
sidebar_position: 1
keywords: 
  - Zilliz データベース
  - Unstructured Data
  - ベクトル データベース
  - IVF
  - zilliz
  - zilliz cloud
  - cloud
  - CreatePartition()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# CreatePartition()

コレクションにパーティションを作成します。

```c++
Status CreatePartition(const CreatePartitionRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = CreatePartitionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithPartitionName(partition_name);
```

**リクエスト メソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが適用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

- `WithPartitionName(const std::string& partition_name)`

    パーティション名を設定します。

**戻り値:**

*Status*

`status.IsOk()` を確認して、成功したかどうかを判定します。

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

status = client->CreatePartition(milvus::CreatePartitionRequest()
                                     .WithDatabaseName(db_name)
                                     .WithCollectionName(collection_name)
                                     .WithPartitionName(partition_name));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

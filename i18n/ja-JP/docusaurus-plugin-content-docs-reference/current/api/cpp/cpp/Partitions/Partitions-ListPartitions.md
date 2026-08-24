---
title: "ListPartitions() | Cloud"
slug: /cpp/cpp/Partitions-ListPartitions
sidebar_label: "ListPartitions()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、コレクション内のパーティションの一覧を取得します。 | Cloud"
type: docx
token: PwncdGtEvoxsajxmubhc5O6anqc
sidebar_position: 5
keywords: 
  - knn
  - Image Search
  - LLMs
  - Machine Learning
  - zilliz
  - zilliz cloud
  - cloud
  - ListPartitions()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ListPartitions()

この操作は、コレクション内のパーティションの一覧を取得します。

```c++
Status ListPartitions(const ListPartitionsRequest& request, ListPartitionsResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = ListPartitionsRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name);
```

**リクエスト メソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが適用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

**戻り値:**

*ListPartitionsResponse* を含む *Status*

成功したかどうかは `status.IsOk()` で確認できます。

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

milvus::ListPartitionsResponse resp_list_part;
status = client->ListPartitions(
    milvus::ListPartitionsRequest().WithDatabaseName(db_name).WithCollectionName(collection_name), resp_list_part);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "\nPartitions of " << collection_name << ":" << std::endl;
for (auto& info : resp_list_part.PartitionInfos()) {
    std::cout << "\t" << info.Name() << std::endl;
}
```

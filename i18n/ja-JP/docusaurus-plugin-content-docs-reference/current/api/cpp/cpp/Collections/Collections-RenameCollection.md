---
title: "RenameCollection() | Cloud"
slug: /cpp/cpp/Collections-RenameCollection
sidebar_label: "RenameCollection()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "コレクションの名前を変更する操作です。 | Cloud"
type: docx
token: EyHadkgMtohFXxxEEcucWAC5nje
sidebar_position: 31
keywords: 
  - オープンソースベクトルデータベース
  - ベクトルインデックス
  - オープンソースベクトルデータベース
  - オープンソースベクトルDB
  - zilliz
  - zilliz cloud
  - cloud
  - RenameCollection()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# RenameCollection()

この操作は、コレクションの名前を変更します。

```c++
Status RenameCollection(const RenameCollectionRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = RenameCollectionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name1)
    .WithNewCollectionName(collection_name2);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合は、デフォルトのデータベースが適用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

- `WithNewCollectionName(const std::string& collection_name)`

    コレクションの新しい名前を設定します。

**戻り値:**

*Status*

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

status = client->RenameCollection(
    milvus::RenameCollectionRequest()
        .WithCollectionName("old_collection")
        .WithNewCollectionName("new_collection"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

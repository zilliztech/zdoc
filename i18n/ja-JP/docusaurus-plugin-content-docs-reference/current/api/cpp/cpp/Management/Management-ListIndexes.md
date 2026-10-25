---
title: "ListIndexes() | Cloud"
slug: /cpp/cpp/Management-ListIndexes
sidebar_label: "ListIndexes()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、コレクションのインデックス名を取得します。 | Cloud"
type: docx
token: QO98dfF7qoLAWYxwsy2cfalvntc
sidebar_position: 15
keywords: 
  - Faiss ベクトルデータベース
  - Chroma ベクトルデータベース
  - nlp 検索
  - LLM のハルシネーション
  - zilliz
  - zilliz cloud
  - cloud
  - ListIndexes()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# ListIndexes()

この操作は、コレクションのインデックス名を取得します。

```c++
Status ListIndexes(const ListIndexesRequest& request, ListIndexesResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = ListIndexesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFieldName(field_name);
```

**リクエストメソッド：**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合は、デフォルトのデータベースが適用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクションの名前を設定します。

- `WithFieldName(const std::string& field_name)`

    フィールド名を設定します。空の場合は、すべてのフィールドのインデックスが返されます。

**戻り値：**

*ListIndexesResponse* を含む *Status*

`status.IsOk()` を確認し、成功したかどうかを判断します。

**例外：**

- **StatusCode**

    エラーの詳細については、`status.Code()` および `status.Message()` を確認してください。

## 例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::ListIndexesResponse response;
status = client->ListIndexes(
    milvus::ListIndexesRequest()
        .WithCollectionName("my_collection"),
    response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
for (const auto& index_name : response.IndexNames()) {
    std::cout << "Index: " << index_name << std::endl;
}
```

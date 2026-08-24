---
title: "ListIndexes() | Cloud"
slug: /cpp/cpp/Management-ListIndexes
sidebar_label: "ListIndexes()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "コレクションのインデックス名を取得します。 | Cloud"
type: docx
token: U7Y9dr70qoyDGYxlgBTcOGTgnbd
sidebar_position: 13
keywords: 
  - Faiss ベクトル データベース
  - Chroma ベクトル データベース
  - nlp search
  - hallucinations llm
  - zilliz
  - zilliz cloud
  - cloud
  - ListIndexes()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
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
    .WithCollectionName(collection_name);
```

**リクエスト メソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが適用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

**戻り値:**

*ListIndexesResponse* を含む *Status*

`status.IsOk()` を確認し、成功したかどうかを判断します。

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

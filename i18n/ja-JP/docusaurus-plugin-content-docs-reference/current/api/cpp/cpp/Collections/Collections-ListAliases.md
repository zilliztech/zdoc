---
title: "ListAliases() | Cloud"
slug: /cpp/cpp/Collections-ListAliases
sidebar_label: "ListAliases()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、コレクションに関連付けられたすべてのエイリアスの一覧を返します。 | Cloud"
type: docx
token: YE0GdEE34oJXt3xyGLZc8H5Inkc
sidebar_position: 28
keywords: 
  - ベクトル検索
  - knnアルゴリズム
  - HNSW
  - 非構造化データとは
  - zilliz
  - zilliz cloud
  - cloud
  - ListAliases()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ListAliases()

この操作は、コレクションに関連付けられたすべてのエイリアスの一覧を返します。

```c++
Status ListAliases(const ListAliasesRequest& request, ListAliasesResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = ListAliasesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが適用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

**戻り値:**

*Status* および *ListAliasesResponse*

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

milvus::ListAliasesResponse response;
status = client->ListAliases(
    milvus::ListAliasesRequest()
        .WithCollectionName("my_collection"),
    response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
for (const auto& alias : response.Aliases()) {
    std::cout << "Alias: " << alias << std::endl;
}
```

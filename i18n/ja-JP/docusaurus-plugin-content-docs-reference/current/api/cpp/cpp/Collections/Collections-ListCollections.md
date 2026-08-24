---
title: "ListCollections() | Cloud"
slug: /cpp/cpp/Collections-ListCollections
sidebar_label: "ListCollections()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、各コレクションの概要情報を含むすべてのコレクションの一覧を返します。 | Cloud"
type: docx
token: A5FAdLCowoBG4sxh5vEcRH0Nnkb
sidebar_position: 29
keywords: 
  - ベクトルデータベース
  - IVF
  - knn
  - 画像検索
  - zilliz
  - zilliz cloud
  - cloud
  - ListCollections()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ListCollections()

この操作は、各コレクションの概要情報を含むすべてのコレクションの一覧を返します。

```c++
Status ListCollections(const ListCollectionsRequest& request, ListCollectionsResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = ListCollectionsRequest()
    .WithDatabaseName(db_name)
    .WithOnlyShowLoaded(only_show_loaded);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが適用されます。

- `WithOnlyShowLoaded(bool only_show_loaded)`

    ロード済みのコレクションのみを表示するか、すべてのコレクションを表示するかを指定するフラグを設定します。デフォルト: `false`。

**戻り値:**

*Status* および *ListCollectionsResponse*

`status.IsOk()` を確認して、成功したかどうかを判断します。

**例外:**

- **StatusCode**

    エラーの詳細については、`status.Code()` と `status.Message()` を確認してください。

## 例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::ListCollectionsResponse resp_list_coll;
status = client->ListCollections(
    milvus::ListCollectionsRequest()
        .WithDatabaseName(db_name), 
    resp_list_coll
);

if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "\nCollections:" << std::endl;
for (auto& name : resp_list_coll.CollectionNames()) {
    std::cout << "\t" << name << std::endl;
}
```

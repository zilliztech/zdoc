---
title: "DropCollection() | Cloud"
slug: /cpp/cpp/Collections-DropCollection
sidebar_label: "DropCollection()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、すべてのパーティション、インデックス、セグメントを含めてコレクションを削除します。 | Cloud"
type: docx
token: QGzdd5UMMo3gKpx0hNgcvA9jnOb
sidebar_position: 20
keywords: 
  - マルチモーダル検索
  - ベクトル検索アルゴリズム
  - 質問応答システム
  - llm-as-a-judge
  - zilliz
  - zilliz cloud
  - cloud
  - DropCollection()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropCollection()

この操作は、すべてのパーティション、インデックス、セグメントを含めてコレクションを削除します。

```c++
Status DropCollection(const DropCollectionRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = DropCollectionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが適用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

**戻り値:**

*Status*

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

status = client->DropCollection(
    milvus::DropCollectionRequest()
        .WithCollectionName(collection_name)
);

if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

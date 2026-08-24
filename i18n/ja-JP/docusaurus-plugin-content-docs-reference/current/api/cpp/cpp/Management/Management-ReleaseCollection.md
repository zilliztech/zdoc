---
title: "ReleaseCollection() | Cloud"
slug: /cpp/cpp/Management-ReleaseCollection
sidebar_label: "ReleaseCollection()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、クエリノードからコレクションのデータを解放します。 | Cloud"
type: docx
token: RzmYdsC1joL3LuxT765csIbwnCh
sidebar_position: 20
keywords: 
  - ベクトル類似検索
  - 近似最近傍探索
  - DiskANN
  - スパースベクトル
  - zilliz
  - zilliz cloud
  - cloud
  - ReleaseCollection()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ReleaseCollection()

この操作は、クエリノードからコレクションのデータを解放します。

```c++
Status ReleaseCollection(const ReleaseCollectionRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = ReleaseCollectionRequest()
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

status = client->ReleaseCollection(
    milvus::ReleaseCollectionRequest()
        .WithCollectionName(collection_name)
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

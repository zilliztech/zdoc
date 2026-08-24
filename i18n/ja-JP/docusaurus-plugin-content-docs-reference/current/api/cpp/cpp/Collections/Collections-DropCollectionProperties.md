---
title: "DropCollectionProperties() | Cloud"
slug: /cpp/cpp/Collections-DropCollectionProperties
sidebar_label: "DropCollectionProperties()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、コレクションのプロパティを削除します。 | Cloud"
type: docx
token: Sljyd2yrWoidNAxyCgRc255Mnhg
sidebar_position: 23
keywords: 
  - セマンティック検索とは
  - 埋め込みモデル
  - 画像類似検索
  - コンテキストウィンドウ
  - zilliz
  - zilliz cloud
  - cloud
  - DropCollectionProperties()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropCollectionProperties()

この操作は、コレクションのプロパティを削除します。

```c++
Status DropCollectionProperties(const DropCollectionPropertiesRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = DropCollectionPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithPropertyKeys(keys);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが適用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

- `WithPropertyKeys(std::set<std::string>&& keys)`

    このコレクションから削除するプロパティを設定します。

- `AddPropertyKey(const std::string& key)`

    このコレクションから削除するプロパティを1つ設定します。

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

status = client->DropCollectionProperties(
    milvus::DropCollectionPropertiesRequest()
        .WithDatabaseName(db_name)
        .WithCollectionName(collection_name)
        .AddPropertyKey(milvus::COLLECTION_TTL_SECONDS)
);

if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

---
title: "DropIndexProperties() | Cloud"
slug: /cpp/cpp/Management-DropIndexProperties
sidebar_label: "DropIndexProperties()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "指定したインデックスからプロパティを削除します。 | Cloud"
type: docx
token: SbJbdoDksoWVlxxvXQDcKYKsn4q
sidebar_position: 6
keywords: 
  - DiskANN
  - Sparse ベクトル
  - ベクトル Dimension
  - ANN Search
  - zilliz
  - zilliz cloud
  - cloud
  - DropIndexProperties()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropIndexProperties()

この操作は、指定したインデックスからプロパティを削除します。

```c++
Status DropIndexProperties(const DropIndexPropertiesRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = DropIndexPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithIndexName(index_name)
    .WithPropertyKeys(keys);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが適用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

- `WithIndexName(const std::string& index_name)`

    インデックス名を設定します。この操作ではフィールド名ではなくインデックス名を指定してください。

- `WithPropertyKeys(std::set<std::string>&& keys)`

    このインデックスから削除するプロパティ名を設定します。

- `AddPropertyKey(const std::string& key)`

    削除するプロパティ名を設定します。

**戻り値:**

*Status*

`status.IsOk()` を確認し、成功したかどうかを判定します。

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

status = client->DropIndexProperties(milvus::DropIndexPropertiesRequest()
                                         .WithCollectionName(collection_name)
                                         .WithIndexName("vector_index_name")
                                         .AddPropertyKey(milvus::MMAP_ENABLED));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

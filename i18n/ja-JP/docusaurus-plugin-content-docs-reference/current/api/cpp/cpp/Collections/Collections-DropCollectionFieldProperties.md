---
title: "DropCollectionFieldProperties() | Cloud"
slug: /cpp/cpp/Collections-DropCollectionFieldProperties
sidebar_label: "DropCollectionFieldProperties()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "フィールドのプロパティを削除します。 | Cloud"
type: docx
token: VWOqdczvioTtxqxThEKcJzI3n2g
sidebar_position: 21
keywords: 
  - Zilliz データベース
  - 非構造化データ
  - ベクトルデータベース
  - IVF
  - zilliz
  - zilliz cloud
  - cloud
  - DropCollectionFieldProperties()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropCollectionFieldProperties()

フィールドのプロパティを削除します。

```c++
Status DropCollectionFieldProperties(const DropCollectionFieldPropertiesRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = DropCollectionFieldPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFieldName(field_name)
    .WithPropertyKeys(keys);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが適用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

- `WithFieldName(const std::string& field_name)`

    フィールド名を設定します。

- `WithPropertyKeys(std::set<std::string>&& keys)`

    このフィールドから削除するプロパティを設定します。

- `AddPropertyKey(const std::string& key)`

    このフィールドから削除するプロパティを1つ設定します。

**戻り値:**

*Status*

`status.IsOk()` を確認して、成功したかどうかを判定します。

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

status = client->DropCollectionFieldProperties(
    milvus::DropCollectionFieldPropertiesRequest()
        .WithCollectionName("my_collection")
        .WithFieldName("my_field")
        .AddPropertyKey("max_length"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

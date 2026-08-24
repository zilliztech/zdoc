---
title: "AlterCollectionFieldProperties() | Cloud"
slug: /cpp/cpp/Collections-AlterCollectionFieldProperties
sidebar_label: "AlterCollectionFieldProperties()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はフィールドのプロパティを変更します。 | Cloud"
type: docx
token: A3gld3Xjco1VxSxi6Ndc3Bq4nuh
sidebar_position: 5
keywords: 
  - 自然言語検索
  - 類似検索
  - マルチモーダルRAG
  - LLM幻覚
  - zilliz
  - zilliz cloud
  - cloud
  - AlterCollectionFieldProperties()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# AlterCollectionFieldProperties()

この操作は、フィールドのプロパティを変更します。

```c++
Status AlterCollectionFieldProperties(const AlterCollectionFieldPropertiesRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = AlterCollectionFieldPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFieldName(field_name)
    .WithProperties(properties);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが適用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

- `WithFieldName(const std::string& field_name)`

    対象フィールドの名前を設定します。

- `WithProperties(std::unordered_map<std::string, std::string>&& properties)`

    指定したフィールドで変更するプロパティを設定します。詳細については、[このページ](https://milvus.io/docs/alter-collection-field.md)を参照してください。

**戻り値:**

*Status*

`status.IsOk()` を確認し、成功したかどうかを判断します。

**例外:**

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

status = client->AlterCollectionFieldProperties(
    milvus::AlterCollectionFieldPropertiesRequest()
        .WithCollectionName("my_collection")
        .WithFieldName("my_field")
        .AddProperty("max_length", "512"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

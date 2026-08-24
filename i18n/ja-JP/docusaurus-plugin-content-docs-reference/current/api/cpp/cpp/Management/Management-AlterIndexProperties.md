---
title: "AlterIndexProperties() | Cloud"
slug: /cpp/cpp/Management-AlterIndexProperties
sidebar_label: "AlterIndexProperties()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、インデックスのプロパティを変更します。 | Cloud"
type: docx
token: TKJ0dmfeiojGU8xOyixcO4M5ncb
sidebar_position: 1
keywords: 
  - ハイブリッドベクトル検索
  - ビデオ重複排除
  - ビデオ類似検索
  - ベクトル検索
  - zilliz
  - zilliz cloud
  - cloud
  - AlterIndexProperties()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# AlterIndexProperties()

この操作は、インデックスのプロパティを変更します。

```c++
Status AlterIndexProperties(const AlterIndexPropertiesRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = AlterIndexPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithIndexName(index_name)
    .WithProperties(value);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが適用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

- `WithIndexName(const std::string& index_name)`

    インデックス名を設定します。この操作ではフィールド名ではなくインデックス名を指定してください。

- `WithProperties(std::unordered_map<std::string, std::string>&& properties)`

    指定したインデックスで変更するプロパティを設定します。利用可能なインデックスプロパティについては、[このページ](https://milvus.io/docs/mmap.md#Index-specific-mmap-settings)を参照してください。

- `AddProperty(const std::string& key, const std::string& property)`

    このインデックスにプロパティを追加します。

**戻り値:**

*Status*

`status.IsOk()` を確認して、成功したかどうかを判定します。

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

status = client->AlterIndexProperties(milvus::AlterIndexPropertiesRequest()
                                          .WithCollectionName(collection_name)
                                          .WithIndexName("vector_index_name")
                                          .AddProperty(milvus::MMAP_ENABLED, "true"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

---
title: "AlterCollectionProperties() | Cloud"
slug: /cpp/cpp/Collections-AlterCollectionProperties
sidebar_label: "AlterCollectionProperties()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はコレクションのプロパティを変更します。 | Cloud"
type: docx
token: H5oLd8ZVfooSgixa5O9cyq37nCb
sidebar_position: 7
keywords: 
  - 音声類似検索
  - Elasticベクトルデータベース
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - AlterCollectionProperties()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# AlterCollectionProperties()

この操作はコレクションのプロパティを変更します。

```c++
Status AlterCollectionProperties(const AlterCollectionPropertiesRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = AlterCollectionPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithProperties(properties);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが適用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

- `WithProperties(std::unordered_map<std::string, std::string>&& properties)`

    このコレクションの変更後のプロパティを設定します。利用可能なプロパティについては、[サポートされているプロパティ](https://milvus.io/docs/modify-collection.md#Supported-properties) を参照してください。

- `AddProperty(const std::string& key, const std::string& property)`

    このコレクションのいずれかのプロパティを設定します。利用可能なプロパティについては、[サポートされているプロパティ](https://milvus.io/docs/modify-collection.md#Supported-properties) を参照してください。

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

status = client->AlterCollectionProperties(
    milvus::AlterCollectionPropertiesRequest()
        .WithDatabaseName(db_name)
        .WithCollectionName(collection_name)
        .AddProperty(milvus::COLLECTION_TTL_SECONDS, "20")
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

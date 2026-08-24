---
title: "DropDatabaseProperties() | Cloud"
slug: /cpp/cpp/Database-DropDatabaseProperties
sidebar_label: "DropDatabaseProperties()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、データベースのプロパティを削除します。 | Cloud"
type: docx
token: LBSwdc3WTo0vbQxTO4uca77EnWd
sidebar_position: 5
keywords: 
  - ベクトルデータベースとは
  - vectordb
  - マルチモーダルベクトルデータベース検索
  - Retrieval Augmented Generation
  - zilliz
  - zilliz cloud
  - cloud
  - DropDatabaseProperties()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropDatabaseProperties()

この操作は、データベースのプロパティを削除します。

```c++
Status DropDatabaseProperties(const DropDatabasePropertiesRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = DropDatabasePropertiesRequest()
    .WithDatabaseName(db_name)
    .WithPropertyKeys(keys);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが適用されます。

- `WithPropertyKeys(std::set<std::string>&& keys)`

    削除するデータベースプロパティのキーを設定します。

- `AddPropertyKey(const std::string& key)`

    削除対象のキーを追加します。

**戻り値:**

*Status*

成功したかどうかを確認するには、`status.IsOk()` を参照してください。

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

status = client->DropDatabaseProperties(
    milvus::DropDatabasePropertiesRequest()
        .WithDatabaseName("my_database")
        .AddPropertyKey("key"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

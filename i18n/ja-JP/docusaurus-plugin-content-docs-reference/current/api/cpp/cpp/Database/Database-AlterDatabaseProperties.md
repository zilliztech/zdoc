---
title: "AlterDatabaseProperties() | Cloud"
slug: /cpp/cpp/Database-AlterDatabaseProperties
sidebar_label: "AlterDatabaseProperties()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はデータベースのプロパティを変更します。 | Cloud"
type: docx
token: XPsfdhNDhopm2Ux7HKncEtZonjh
sidebar_position: 1
keywords: 
  - milvus benchmark
  - managed milvus
  - Serverless ベクトル データベース
  - milvus open source
  - zilliz
  - zilliz cloud
  - cloud
  - AlterDatabaseProperties()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# AlterDatabaseProperties()

この操作は、データベースのプロパティを変更します。

```c++
Status AlterDatabaseProperties(const AlterDatabasePropertiesRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = AlterDatabasePropertiesRequest()
    .WithDatabaseName(db_name)
    .WithProperties(properties);
```

**リクエスト メソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合は、デフォルトのデータベースが適用されます。

- `WithProperties(std::unordered_map<std::string, std::string>&& properties)`

    このデータベースの変更後のプロパティを設定します。利用可能なデータベースのプロパティについては、[このページ](https://milvus.io/docs/manage_databases.md#Manage-database-properties)を参照してください。

- `AddProperty(const std::string& key, const std::string& property)`

    このデータベースにプロパティを追加します。

**戻り値:**

*Status*

`status.IsOk()` を確認して、成功したかどうかを判断します。

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

status = client->AlterDatabaseProperties(
    milvus::AlterDatabasePropertiesRequest()
        .WithDatabaseName("my_database")
        .AddProperty("key", "value"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

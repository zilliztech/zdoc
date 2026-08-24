---
title: "CreateDatabase() | Cloud"
slug: /cpp/cpp/Database-CreateDatabase
sidebar_label: "CreateDatabase()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "新しいデータベースを作成します。 | Cloud"
type: docx
token: J7vTderKqoQFotxp1RUcLVzenBv
sidebar_position: 2
keywords: 
  - RAG
  - NLP
  - Neural Network
  - Deep Learning
  - zilliz
  - zilliz cloud
  - cloud
  - CreateDatabase()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# CreateDatabase()

新しいデータベースを作成します。

```c++
Status CreateDatabase(const CreateDatabaseRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = CreateDatabaseRequest()
    .WithDatabaseName(db_name)
    .WithProperties(properties);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが適用されます。

- `WithProperties(std::unordered_map<std::string, std::string>&& properties)`

    このデータベースのプロパティを設定します。

- `AddProperty(const std::string& key, const std::string& property)`

    このデータベースにプロパティを追加します。

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

std::unordered_map<std::string, std::string> props;
props.emplace("database.replica.number", "2");
status = client->CreateDatabase(
    milvus::CreateDatabaseRequest()
        .WithDatabaseName(my_db_name)
        .WithProperties(std::move(props))
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

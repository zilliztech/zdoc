---
title: "CreateAlias() | Cloud"
slug: /cpp/cpp/Collections-CreateAlias
sidebar_label: "CreateAlias()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はコレクションのエイリアスを作成します。検索やクエリでは、コレクション名の代わりにエイリアスを使用できます。 | Cloud"
type: docx
token: TCOmduhQKosBcNxfUQOcLdzqnAf
sidebar_position: 13
keywords: 
  - openai ベクトル db
  - natural language processing データベース
  - cheap ベクトル データベース
  - Managed ベクトル データベース
  - zilliz
  - zilliz cloud
  - cloud
  - CreateAlias()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# CreateAlias()

この操作はコレクションのエイリアスを作成します。検索やクエリでは、コレクション名の代わりにエイリアスを使用できます。

```c++
Status CreateAlias(const CreateAliasRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = CreateAliasRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithAlias(alias);
```

**リクエスト メソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが適用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

- `WithAlias(const std::string& alias)`

    エイリアス名を設定します。

**戻り値:**

*Status*

`status.IsOk()` を確認し、成功したかどうかを判断します。

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

status = client->CreateAlias(
    milvus::CreateAliasRequest()
        .WithCollectionName("my_collection")
        .WithAlias("my_alias"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

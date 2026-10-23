---
title: "CreateAlias() | Cloud"
slug: /cpp/cpp/Collections-CreateAlias
sidebar_label: "CreateAlias()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作はコレクションのエイリアスを作成します。これにより、検索呼び出しおよびクエリ呼び出しでは、コレクション名の代わりにエイリアスを使用してコレクションを指定できます。 | Cloud"
type: docx
token: Pz42dXmiqoCNScx0MPzcjmXLnib
sidebar_position: 13
keywords: 
  - openai ベクトル db
  - 自然言語処理データベース
  - 低コストのベクトルデータベース
  - マネージドベクトルデータベース
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

この操作はコレクションのエイリアスを作成します。これにより、検索呼び出しおよびクエリ呼び出しでは、コレクション名の代わりにエイリアスを使用してコレクションを指定できます。

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

**リクエストメソッド：**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合は、デフォルトのデータベースが使用されます。

- `WithCollectionName(const std::string& collection_name)`

    エイリアスを作成する対象のコレクション名を設定します。

- `WithAlias(const std::string& alias)`

    作成するエイリアス名を設定します。

**戻り値：**

*Status*

エイリアスが正常に作成されたかどうかを示す Status を返します。

**エラー処理：**

- **std::exception**

    リクエストの構築、転送、またはレスポンスの処理に失敗したときにスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

接続済みの MilvusClientV2 で CreateAlias() を呼び出し、既存のコレクションを参照するエイリアスを作成します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::CreateAliasRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithAlias(alias);
status = client->CreateAlias(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

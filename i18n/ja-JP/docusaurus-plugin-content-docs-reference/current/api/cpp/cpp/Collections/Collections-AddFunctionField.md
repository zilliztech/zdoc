---
title: "AddFunctionField() | Cloud"
slug: /cpp/cpp/Collections-AddFunctionField
sidebar_label: "AddFunctionField()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "既存のコレクションに関数ベースの出力フィールドを追加します。 | Cloud"
type: docx
token: TcF2doHmuoNHsKxRRJbcsYevnph
sidebar_position: 34
keywords: 
  - ビデオ検索
  - AIハルシネーション
  - AIエージェント
  - セマンティック検索
  - zilliz
  - zilliz cloud
  - cloud
  - AddFunctionField()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# AddFunctionField()

既存のコレクションに関数ベースの出力フィールドを追加します。

```c++
Status AddFunctionField(const AddFunctionFieldRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = AddFunctionFieldRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithField(field_schema)
    .WithFunction(function)
    .WithIndex(index);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが使用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

- `WithField(FieldSchema&& field_schema)`

    フィールドスキーマを設定します。

- `WithFunction(const FunctionPtr& function)`

    追加する関数を設定します。

- `WithIndex(IndexDesc&& index)`

    関数の出力フィールドにバインドするインデックスを設定します。バインドされたインデックスは必須であり、明示的なインデックスタイプを使用する必要があります。AUTOINDEX はサポートされていません。

**戻り値:**

*Status*

操作の成否を示すステータスを返します。

**エラーハンドリング:**

- **std::exception**

    リクエストの構築、転送、またはレスポンス処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

C++ SDK を使用した AddFunctionField() の使用例を示します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::AddFunctionFieldRequest();
util::CheckStatus(client->AddFunctionField(request));
```

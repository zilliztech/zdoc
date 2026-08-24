---
title: "AddCollectionStructField() | Cloud"
slug: /cpp/cpp/Collections-AddCollectionStructField
sidebar_label: "AddCollectionStructField()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "既存のコレクションに struct フィールドを追加します。 | Cloud"
type: docx
token: GWPxd80BYoQleSxNCPNcFvWsnzb
sidebar_position: 33
keywords: 
  - 自然言語検索
  - 類似性検索
  - マルチモーダル RAG
  - LLM の幻覚
  - zilliz
  - zilliz cloud
  - cloud
  - AddCollectionStructField()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# AddCollectionStructField()

既存のコレクションに struct フィールドを追加します。

```c++
Status AddCollectionStructField(const AddCollectionStructFieldRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = AddCollectionStructFieldRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithStructField(field_schema);
```

**リクエスト メソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが使用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

- `WithStructField(StructFieldSchema&& field_schema)`

    struct フィールドのスキーマを設定します。

**戻り値:**

*Status*

操作の成否を示すステータスを返します。

**エラー処理:**

- **std::exception**

    リクエストの構築、転送、またはレスポンス処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

C++ SDK を使用した AddCollectionStructField() の使用例を示します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::AddCollectionStructFieldRequest();
util::CheckStatus(client->AddCollectionStructField(request));
```

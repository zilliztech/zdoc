---
title: "DropCollectionField() | Cloud"
slug: /cpp/cpp/Collections-DropCollectionField
sidebar_label: "DropCollectionField()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "既存のコレクションからフィールドを削除します。 | Cloud"
type: docx
token: Qgmsdk9v3oAOXlxlx0nc1svZn2b
sidebar_position: 35
keywords: 
  - milvus benchmark
  - managed milvus
  - Serverless ベクトル データベース
  - milvus open source
  - zilliz
  - zilliz cloud
  - cloud
  - DropCollectionField()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropCollectionField()

既存のコレクションからフィールドを削除します。

```c++
Status DropCollectionField(const DropCollectionFieldRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = DropCollectionFieldRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFieldName(field_name)
    .WithFieldID(field_id);
```

**リクエスト メソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが使用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

- `WithFieldName(std::string field_name)`

    削除するフィールド名を設定します。

- `WithFieldID(int64_t field_id)`

    削除するフィールドの ID を設定します。

**戻り値:**

*Status*

操作の成否を示すステータスを返します。

**エラー処理:**

- **std::exception**

    リクエストの構築、転送、またはレスポンス処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

C++ SDK を使用した DropCollectionField() の使用例を示します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::DropCollectionFieldRequest();
util::CheckStatus(client->DropCollectionField(request));
```

---
title: "AddCollectionField() | Cloud"
slug: /cpp/cpp/Collections-AddCollectionField
sidebar_label: "AddCollectionField()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "既存のコレクションにフィールドを追加します。 | Cloud"
type: docx
token: KMuzdtwSaoadnbx0caLcHCAGn1b
sidebar_position: 1
keywords: 
  - HNSW
  - What is unstructured data
  - ベクトル埋め込み
  - ベクトルストア
  - zilliz
  - zilliz cloud
  - cloud
  - AddCollectionField()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# AddCollectionField()

既存のコレクションにフィールドを追加します。

```c++
Status AddCollectionField(const AddCollectionFieldRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = AddCollectionFieldRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithField(field_schema);
```

**リクエスト メソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが使用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

- `WithField(FieldSchema&& field_schema)`

    フィールドのスキーマを設定します。

**戻り値:**

*Status*

操作の成否を示すステータスを返します。

**エラー処理:**

- **std::exception**

    リクエストの構築、転送、またはレスポンス処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

C++ SDK を使用した AddCollectionField() の使用例を示します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::AddCollectionFieldRequest();
util::CheckStatus(client->AddCollectionField(request));
```

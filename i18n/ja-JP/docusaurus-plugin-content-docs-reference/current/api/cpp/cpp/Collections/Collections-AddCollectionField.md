---
title: "AddCollectionField() | Cloud"
slug: /cpp/cpp/Collections-AddCollectionField
sidebar_label: "AddCollectionField()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、既存のコレクションのスキーマに新しいフィールドを追加します。 | Cloud"
type: docx
token: KMuzdtwSaoadnbx0caLcHCAGn1b
sidebar_position: 1
keywords: 
  - HNSW
  - 非構造化データとは
  - ベクトル埋め込み
  - ベクトルストア
  - zilliz
  - zilliz cloud
  - cloud
  - AddCollectionField()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# AddCollectionField()

この操作は、既存のコレクションのスキーマに新しいフィールドを追加します。

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

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合は、デフォルトのデータベースが使用されます。

- `WithCollectionName(const std::string& collection_name)`

    フィールドを追加するコレクションの名前を設定します。

- `WithField(FieldSchema&& field_schema)`

    追加するフィールドのスキーマを設定します。リクエストは右辺値参照を介してフィールドスキーマの所有権を取得するため、std::move を使用して渡してください。

**戻り値:**

*Status*

フィールドが正常に追加されたかどうかを示す Status を返します。

**エラー処理:**

- **std::exception**

    リクエストの構築、転送、またはレスポンス処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

接続済みの MilvusClientV2 で AddCollectionField() を呼び出し、既存のコレクションに新しいフィールドを追加します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::FieldSchema field_schema{"age", milvus::DataType::INT64};
field_schema.WithNullable(true);  // Nullable so rows can omit the value.

auto request = milvus::AddCollectionFieldRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithField(std::move(field_schema));
status = client->AddCollectionField(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

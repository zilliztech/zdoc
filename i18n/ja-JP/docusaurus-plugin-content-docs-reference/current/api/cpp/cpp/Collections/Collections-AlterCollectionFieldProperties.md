---
title: "AlterCollectionFieldProperties() | Cloud"
slug: /cpp/cpp/Collections-AlterCollectionFieldProperties
sidebar_label: "AlterCollectionFieldProperties()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、既存のコレクション内の指定されたフィールドのプロパティを変更します。 | Cloud"
type: docx
token: TgEBdtrFron6aCxAE37cqHd3nvc
sidebar_position: 5
keywords: 
  - 自然言語検索
  - 類似検索
  - マルチモーダル RAG
  - LLM ハルシネーション
  - zilliz
  - zilliz cloud
  - cloud
  - AlterCollectionFieldProperties()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# AlterCollectionFieldProperties()

この操作では、既存のコレクション内の指定されたフィールドのプロパティを変更します。

```c++
Status AlterCollectionFieldProperties(const AlterCollectionFieldPropertiesRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = AlterCollectionFieldPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFieldName(field_name)
    .WithProperties(properties)
    .AddProperty(key, property);
```

**リクエストメソッド：**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合は、デフォルトのデータベースが使用されます。

- `WithCollectionName(const std::string& collection_name)`

    変更するフィールドを含むコレクションの名前を設定します。

- `WithFieldName(const std::string& field_name)`

    変更するフィールドの名前を設定します。

- `WithProperties(std::unordered_map<std::string, std::string>&& properties)`

    フィールドに適用するプロパティを key/value のペアとして設定します。リクエストは右辺値参照を介してマップの所有権を取得するため、std::move を使用して渡します。

- `AddProperty(const std::string& key, const std::string& property)`

    フィールドに適用する単一のプロパティの key/value ペアを追加します。

**戻り値：**

*Status*

フィールドのプロパティが正常に変更されたかどうかを示す Status を返します。

**エラー処理：**

- **std::exception**

    リクエストの構築、転送、またはレスポンスの処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

接続済みの MilvusClientV2 で AlterCollectionFieldProperties() を呼び出して、フィールドのプロパティを変更します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::AlterCollectionFieldPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFieldName(field_name)
    .AddProperty("mmap.enabled", "true");
status = client->AlterCollectionFieldProperties(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

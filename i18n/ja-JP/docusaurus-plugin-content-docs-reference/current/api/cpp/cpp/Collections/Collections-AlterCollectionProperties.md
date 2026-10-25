---
title: "AlterCollectionProperties() | Cloud"
slug: /cpp/cpp/Collections-AlterCollectionProperties
sidebar_label: "AlterCollectionProperties()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、既存のコレクションのプロパティを変更します。 | Cloud"
type: docx
token: P8QFdIyQiojuy1xDQwecMgwRnHg
sidebar_position: 7
keywords: 
  - 音声類似性検索
  - Elastic ベクトルデータベース
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - AlterCollectionProperties()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# AlterCollectionProperties()

この操作は、既存のコレクションのプロパティを変更します。

```c++
Status AlterCollectionProperties(const AlterCollectionPropertiesRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = AlterCollectionPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithProperties(properties)
    .AddProperty(key, property);
```

**リクエストメソッド：**

- `WithDatabaseName(const std::string& db_name)`

    対象データベースの名前を設定します。空のままにすると、デフォルトのデータベースが使用されます。

- `WithCollectionName(const std::string& collection_name)`

    変更するコレクションの名前を設定します。

- `WithProperties(std::unordered_map<std::string, std::string>&& properties)`

    コレクションに適用するプロパティを key/value のペアとして設定します。リクエストは右辺値参照を介してマップの所有権を取得するため、std::move で渡します。

- `AddProperty(const std::string& key, const std::string& property)`

    コレクションに適用する単一のプロパティの key/value のペアを追加します。

**戻り値：**

*Status*

コレクションのプロパティが正常に変更されたかどうかを示す Status を返します。

**エラー処理：**

- **std::exception**

    リクエストの構築、転送、またはレスポンス処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

接続済みの MilvusClientV2 で AlterCollectionProperties() を呼び出し、コレクションのプロパティを変更します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::AlterCollectionPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .AddProperty("mmap.enabled", "true");
status = client->AlterCollectionProperties(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

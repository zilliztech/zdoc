---
title: "DropCollectionFieldProperties() | Cloud"
slug: /cpp/cpp/Collections-DropCollectionFieldProperties
sidebar_label: "DropCollectionFieldProperties()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、既存のコレクションのフィールドから指定されたプロパティを削除します。 | Cloud"
type: docx
token: FCj5dkwVqo6Mlsxi6w9c3c9xnZb
sidebar_position: 21
keywords: 
  - Zilliz データベース
  - 非構造化データ
  - ベクトルデータベース
  - IVF
  - zilliz
  - zilliz cloud
  - クラウド
  - DropCollectionFieldProperties()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropCollectionFieldProperties()

この操作では、既存のコレクションのフィールドから指定されたプロパティを削除します。

```c++
Status DropCollectionFieldProperties(const DropCollectionFieldPropertiesRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = DropCollectionFieldPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFieldName(field_name)
    .WithPropertyKeys(keys)
    .AddPropertyKey(key);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが使用されます。

- `WithCollectionName(const std::string& collection_name)`

    対象のフィールドを含むコレクションの名前を設定します。

- `WithFieldName(const std::string& field_name)`

    プロパティを削除するフィールドの名前を設定します。

- `WithPropertyKeys(std::set<std::string>&& keys)`

    フィールドから削除するプロパティキーを設定します。リクエストは右辺値参照を介してこのセットの所有権を取得するため、std::move を指定して渡します。

- `AddPropertyKey(const std::string& key)`

    フィールドから削除するプロパティキーを1つ追加します。

**戻り値:**

*Status*

フィールドプロパティが正常に削除されたかどうかを示す Status を返します。

**エラー処理:**

- **std::exception**

    リクエストの構築、転送、または応答の処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

接続済みの MilvusClientV2 で DropCollectionFieldProperties() を呼び出し、フィールドのプロパティを削除します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::DropCollectionFieldPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFieldName(field_name)
    .AddPropertyKey("mmap.enabled");
status = client->DropCollectionFieldProperties(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

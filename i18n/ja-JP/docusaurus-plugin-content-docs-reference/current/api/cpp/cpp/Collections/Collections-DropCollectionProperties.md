---
title: "DropCollectionProperties() | Cloud"
slug: /cpp/cpp/Collections-DropCollectionProperties
sidebar_label: "DropCollectionProperties()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、既存のコレクションから指定したプロパティを削除します。 | Cloud"
type: docx
token: BMdudw948onYFzxpJrYc2tlOn7g
sidebar_position: 23
keywords: 
  - セマンティック検索とは
  - 埋め込みモデル
  - 画像類似検索
  - コンテキストウィンドウ
  - zilliz
  - zilliz cloud
  - cloud
  - DropCollectionProperties()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# DropCollectionProperties()

この操作は、既存のコレクションから指定したプロパティを削除します。

```c++
Status DropCollectionProperties(const DropCollectionPropertiesRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = DropCollectionPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithPropertyKeys(keys)
    .AddPropertyKey(key);
```

**リクエストメソッド：**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合は、デフォルトのデータベースが使用されます。

- `WithCollectionName(const std::string& collection_name)`

    プロパティを削除するコレクションの名前を設定します。

- `WithPropertyKeys(std::set<std::string>&& keys)`

    コレクションから削除するプロパティキーを設定します。リクエストは右辺値参照を介してセットの所有権を取得するため、std::move を使用して渡します。

- `AddPropertyKey(const std::string& key)`

    コレクションから削除する単一のプロパティキーを追加します。

**戻り値：**

*Status*

コレクションのプロパティが正常に削除されたかどうかを示す Status を返します。

**エラーハンドリング：**

- **std::exception**

    リクエストの構築、転送、またはレスポンスの処理に失敗した場合にスローされます。失敗の詳細を確認するには、例外メッセージまたは返された Status を調べてください。

## 例\{#example}

接続済みの MilvusClientV2 に対して DropCollectionProperties() を呼び出し、コレクションから指定したプロパティを削除します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

std::set<std::string> property_keys{"mmap.enabled"};

auto request = milvus::DropCollectionPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithPropertyKeys(std::move(property_keys));
status = client->DropCollectionProperties(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

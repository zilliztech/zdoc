---
title: "AlterIndexProperties() | Cloud"
slug: /cpp/cpp/Management-AlterIndexProperties
sidebar_label: "AlterIndexProperties()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作はインデックスのプロパティを変更します。 | Cloud"
type: docx
token: HeMDdOpeKoRdCZxxhEkcWpCunDf
sidebar_position: 1
keywords: 
  - ハイブリッドベクトル検索
  - 動画の重複排除
  - 動画の類似検索
  - ベクトル取得
  - zilliz
  - zilliz cloud
  - クラウド
  - AlterIndexProperties()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# AlterIndexProperties()

この操作はインデックスのプロパティを変更します。

```c++
Status AlterIndexProperties(const AlterIndexPropertiesRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = AlterIndexPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithIndexName(index_name)
    .WithProperties(properties)
    .AddProperty(key, property);
```

**リクエストメソッド：**

- `WithDatabaseName(const std::string& db_name)`

    対象データベースの名前を設定します。空の場合は、デフォルトのデータベースが使用されます。

- `WithCollectionName(const std::string& collection_name)`

    インデックスを含むコレクションの名前を設定します。

- `WithIndexName(const std::string& index_name)`

    インデックスの名前を設定します。現在、この API はインデックス名のみをサポートしています。

- `WithProperties(std::unordered_map<std::string, std::string>&& properties)`

    インデックスで変更するプロパティを設定し、指定されたキーと値のペアからなる unordered_map をリクエストに移動します。

- `AddProperty(const std::string& key, const std::string& property)`

    キーと値のペアで指定された単一のプロパティをインデックスに追加します。

**戻り値：**

*Status*

インデックスのプロパティが正常に変更されたかどうかを示す Status を返します。

**エラー処理：**

- **std::exception**

    リクエストの構築、転送、またはレスポンスの処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

インデックスのプロパティ（mmap の有効化など）を変更するには、接続済みの MilvusClientV2 で AlterIndexProperties() を呼び出します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

std::unordered_map<std::string, std::string> properties{{"mmap.enabled", "true"}};
auto request = milvus::AlterIndexPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithIndexName(index_name)
    .WithProperties(std::move(properties));
status = client->AlterIndexProperties(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

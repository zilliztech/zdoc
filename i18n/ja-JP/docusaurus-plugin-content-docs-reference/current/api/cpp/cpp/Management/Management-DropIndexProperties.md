---
title: "DropIndexProperties() | Cloud"
slug: /cpp/cpp/Management-DropIndexProperties
sidebar_label: "DropIndexProperties()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、インデックスから指定したプロパティを削除します。 | Cloud"
type: docx
token: P03PdoFAHoGTfxxA8AScr9CmnDc
sidebar_position: 6
keywords: 
  - DiskANN
  - Sparse ベクトル
  - ベクトル次元
  - ANN 検索
  - zilliz
  - zilliz cloud
  - クラウド
  - DropIndexProperties()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# DropIndexProperties()

この操作は、インデックスから指定したプロパティを削除します。

```c++
Status DropIndexProperties(const DropIndexPropertiesRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = DropIndexPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithIndexName(index_name)
    .WithPropertyKeys(keys)
    .AddPropertyKey(key);
```

**リクエストメソッド：**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空のままにすると、デフォルトのデータベースが使用されます。

- `WithCollectionName(const std::string& collection_name)`

    インデックスを所有するコレクションの名前を設定します。

- `WithIndexName(const std::string& index_name)`

    プロパティを削除するインデックスの名前を設定します。現在、この API は index_name のみをサポートしています。

- `WithPropertyKeys(std::set<std::string>&& keys)`

    インデックスから削除するプロパティキーを設定します。右辺値参照で std::set&lt;std::string&gt; を受け取るため、その内容はリクエストに移動されます。

- `AddPropertyKey(const std::string& key)`

    インデックスから削除するキーのセットに、単一のプロパティキーを追加します。

**戻り値：**

*Status*

インデックスのプロパティが正常に削除されたかどうかを示す Status を返します。

**エラー処理：**

- **std::exception**

    リクエストの構築、転送、またはレスポンスの処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

インデックスから mmap.enabled プロパティを削除するには、接続済みの MilvusClientV2 で DropIndexProperties() を呼び出します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::DropIndexPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithIndexName(index_name)
    .AddPropertyKey("mmap.enabled");
status = client->DropIndexProperties(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

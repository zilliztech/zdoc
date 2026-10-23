---
title: "AlterAlias() | Cloud"
slug: /cpp/cpp/Collections-AlterAlias
sidebar_label: "AlterAlias()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、既存のエイリアスを現在のコレクションからリクエストで指定したコレクションに再割り当てします。これにより、そのエイリアスを使用する検索およびクエリ呼び出しは、以降、新しいコレクションを対象とするようになります。 | Cloud"
type: docx
token: V2UCd9pXGobxHKxw10HcZBuQn8f
sidebar_position: 4
keywords: 
  - マルチモーダルベクトルデータベース検索
  - 検索拡張生成
  - 大規模言語モデル
  - ベクトル化
  - zilliz
  - zilliz cloud
  - cloud
  - AlterAlias()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# AlterAlias()

この操作は、既存のエイリアスを現在のコレクションからリクエストで指定したコレクションに再割り当てします。これにより、そのエイリアスを使用する検索およびクエリ呼び出しは、以降、新しいコレクションを対象とするようになります。

```c++
Status AlterAlias(const AlterAliasRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = AlterAliasRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithAlias(alias);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合は、デフォルトのデータベースが使用されます。

- `WithCollectionName(const std::string& collection_name)`

    エイリアスの再割り当て先となるコレクション名を設定します。

- `WithAlias(const std::string& alias)`

    変更するエイリアス名を設定します。

**戻り値:**

*Status*

エイリアスが正常に変更されたかどうかを示す Status を返します。

**エラーハンドリング:**

- **std::exception**

    リクエストの構築、トランスポート、またはレスポンスの処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

接続済みの MilvusClientV2 で AlterAlias() を呼び出し、エイリアスを別のコレクションに再割り当てします。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::AlterAliasRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithAlias(alias);
status = client->AlterAlias(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

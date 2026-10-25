---
title: "TruncateCollection() | Cloud"
slug: /cpp/cpp/Collections-TruncateCollection
sidebar_label: "TruncateCollection()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "コレクションを truncate し、コレクション構造を保持したまますべてのデータを削除します。 | Cloud"
type: docx
token: GCNTd5HUkogWVDxUcuLcEusZnlh
sidebar_position: 33
keywords: 
  - レコメンダーシステム
  - 情報検索
  - 次元削減
  - HNSW アルゴリズム
  - zilliz
  - zilliz cloud
  - クラウド
  - TruncateCollection()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# TruncateCollection()

コレクションを truncate し、コレクション構造を維持したまますべてのデータを削除します。

```c++
Status TruncateCollection(const TruncateCollectionRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = TruncateCollectionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name);
```

**リクエスト メソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが使用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

**戻り値:**

*Status*

操作の成否を示すステータスを返します。

**エラー処理:**

- **std::exception**

    リクエストの構築、通信、またはレスポンス処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

C++ SDK を使用した TruncateCollection() の使用例を示します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::TruncateCollectionRequest();
util::CheckStatus(client->TruncateCollection(request));
```

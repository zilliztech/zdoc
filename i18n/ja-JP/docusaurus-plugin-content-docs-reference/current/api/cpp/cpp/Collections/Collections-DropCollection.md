---
title: "DropCollection() | Cloud"
slug: /cpp/cpp/Collections-DropCollection
sidebar_label: "DropCollection()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、コレクションをそのデータおよびインデックスとともに削除します。 | Cloud"
type: docx
token: MjcFdDhKnoUvaCx8QtmclkOKnPn
sidebar_position: 20
keywords: 
  - マルチモーダル検索
  - ベクトル検索アルゴリズム
  - 質問応答システム
  - llm-as-a-judge
  - zilliz
  - zilliz cloud
  - cloud
  - DropCollection()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropCollection()

この操作は、コレクションをそのデータおよびインデックスとともに削除します。

```c++
Status DropCollection(const DropCollectionRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = DropCollectionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが使用されます。

- `WithCollectionName(const std::string& collection_name)`

    削除するコレクションの名前を設定します。

**戻り値:**

*Status*

コレクションが正常に削除されたかどうかを示す Status を返します。

**エラー処理:**

- **std::exception**

    リクエストの構築、転送、またはレスポンス処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

接続済みの MilvusClientV2 に対して DropCollection() を呼び出し、コレクションとそのデータを削除します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::DropCollectionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name);
status = client->DropCollection(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

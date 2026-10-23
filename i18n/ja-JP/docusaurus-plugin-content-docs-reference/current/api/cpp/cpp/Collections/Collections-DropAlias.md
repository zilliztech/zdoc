---
title: "DropAlias() | Cloud"
slug: /cpp/cpp/Collections-DropAlias
sidebar_label: "DropAlias()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作はエイリアスを削除するため、名前はそのコレクションに解決されなくなりますが、基になるコレクションは影響を受けません。 | Cloud"
type: docx
token: JUcUd5B8QoDmc5xEx0LcmVZHnyN
sidebar_position: 19
keywords: 
  - Pinecone と Milvus の比較
  - Chroma と Milvus の比較
  - Annoy ベクトル検索
  - milvus
  - zilliz
  - Zilliz Cloud
  - クラウド
  - DropAlias()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropAlias()

この操作はエイリアスを削除するため、名前はそのコレクションに解決されなくなりますが、基になるコレクションは影響を受けません。

```c++
Status DropAlias(const DropAliasRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = DropAliasRequest()
    .WithDatabaseName(db_name)
    .WithAlias(alias);
```

**リクエストメソッド：**

- `WithDatabaseName(const std::string& db_name)`

    対象データベースの名前を設定します。空の場合は、デフォルトのデータベースが使用されます。

- `WithAlias(const std::string& alias)`

    削除するエイリアスの名前を設定します。

**戻り値：**

*Status*

エイリアスが正常に削除されたかどうかを示す Status を返します。

**エラー処理：**

- **std::exception**

    リクエストの構築、転送、またはレスポンスの処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

接続済みの MilvusClientV2 で DropAlias() を呼び出して、コレクションからエイリアスを削除します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::DropAliasRequest()
    .WithDatabaseName(db_name)
    .WithAlias(alias);
status = client->DropAlias(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

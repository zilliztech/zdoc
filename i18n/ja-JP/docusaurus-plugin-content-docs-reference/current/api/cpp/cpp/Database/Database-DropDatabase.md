---
title: "DropDatabase() | Cloud"
slug: /cpp/cpp/Database-DropDatabase
sidebar_label: "DropDatabase()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、接続された Milvus サーバー上のデータベースを削除します。 | Cloud"
type: docx
token: GkzpdbQMGovXFIx0n8pc6aDinfc
sidebar_position: 4
keywords: 
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - lexical search
  - zilliz
  - zilliz cloud
  - cloud
  - DropDatabase()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# DropDatabase()

この操作は、接続された Milvus サーバー上のデータベースを削除します。

```c++
Status DropDatabase(const DropDatabaseRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = DropDatabaseRequest()
    .WithDatabaseName(db_name);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    削除するデータベースの名前を設定します。

**戻り値:**

*Status*

データベースが正常に削除されたかどうかを示す Status を返します。

**エラー処理:**

- **std::exception**

    リクエストの構築、トランスポート、またはレスポンスの処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

接続された MilvusClientV2 で DropDatabase() を呼び出し、名前を指定してデータベースを削除します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::DropDatabaseRequest()
    .WithDatabaseName(db_name);
status = client->DropDatabase(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

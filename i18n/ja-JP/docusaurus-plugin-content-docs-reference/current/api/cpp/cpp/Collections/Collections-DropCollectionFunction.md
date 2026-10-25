---
title: "DropCollectionFunction() | Cloud"
slug: /cpp/cpp/Collections-DropCollectionFunction
sidebar_label: "DropCollectionFunction()"
beta: false
added_since: v2.6.3
last_modified: v3.0.x
deprecate_since: v3.0.x
notebook: false
description: "この操作は、既存のコレクションの関数を削除します。 | Cloud"
type: docx
token: C6UadudBVopgWOxeZRwcf0uKn6b
sidebar_position: 22
keywords: 
  - 最近傍検索
  - Agentic RAG
  - RAG LLM アーキテクチャ
  - プライベート LLM
  - zilliz
  - zilliz cloud
  - cloud
  - DropCollectionFunction()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# DropCollectionFunction()

この操作は、既存のコレクションの関数を削除します。

<Admonition type="info" title="Notes">

v3.0.x で非推奨になりました。関数をその出力フィールドとバインドされたインデックスとともに削除するには、[DropFunctionField()](./Collections-DropFunctionField) を使用してください。

</Admonition>

```c++
Status DropCollectionFunction(const DropCollectionFunctionRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = DropCollectionFunctionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFunctionName(function_name);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベースの名前を設定します。空の場合は、デフォルトのデータベースが使用されます。

- `WithCollectionName(const std::string& collection_name)`

    対象のコレクションの名前を設定します。

- `WithFunctionName(std::string function_name)`

    削除する関数の名前を設定します。空にはできません。

**戻り値:**

*Status*

関数が正常に削除されたかどうかを示す Status を返します。

**エラーハンドリング:**

- **std::exception**

    リクエストの構築、転送、またはレスポンスの処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

接続済みの MilvusClientV2 で DropCollectionFunction() を呼び出して、既存のコレクションの関数を削除します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::DropCollectionFunctionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFunctionName(function_name);
status = client->DropCollectionFunction(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
